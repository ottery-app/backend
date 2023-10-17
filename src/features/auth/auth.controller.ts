import { Controller, Get, Post, Put, Delete, Body, Headers, HttpException, HttpStatus, Query } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { SeshService } from '../sesh/sesh.service';
import { UserService } from '../user/user.service';
import { CryptService } from '../crypt/crypt.service';
import { ACTIVATION_CODE_LENGTH } from '../crypt/crypt.types';
import { User } from '../user/user.schema';
import {ActivationCodeDto, NewUserDto, LoginDto, role} from "@ottery/ottery-dto";
import { token, id } from '@ottery/ottery-dto';
import { Roles } from '../roles/roles.decorator';
import { UnsecureSesh } from '../sesh/UnsecureSesh.decorator';
import { Sesh } from '../sesh/Sesh.decorator';
import { SeshDocument } from '../sesh/sesh.schema';



@Controller('api/auth')
export class AuthController {
    constructor(
        private emailService: EmailService,
        private seshService: SeshService,
        private userService: UserService,
        private cryptService: CryptService,
    ) {}

    @Put("resend")
    @Roles(role.LOGGEDIN)
    async resendEmail(
        @Sesh() sesh: SeshDocument
    ) {
        try {
            const user = await this.userService.findOneById(sesh.userId);
            
            if (user.activated) {
                throw new HttpException("Account already activated", HttpStatus.BAD_REQUEST);
            }
            
            user.activationCode = this.cryptService.makeCode(ACTIVATION_CODE_LENGTH);
            this.userService.save(user);

            this.emailService.sendActivationCode(
                user.email,
                user.activationCode,
            );
        } catch (e) {
            throw e;
        }
    }
  
    @Put("activate")
    @Roles(role.LOGGEDIN)
    async activateAccount(
        @Sesh() sesh: SeshDocument,
        @Body() createActivateDto: ActivationCodeDto
    ) {
        try {
            await this.userService.activate(
                sesh.userId,
                createActivateDto.code
            );

            return await this.seshService.activate(sesh);
        } catch (e) {
            throw e;
        }
    }
  

    @Post("register")
    @UnsecureSesh()
    async register(
        @Body() createUserDto: NewUserDto,
        @Sesh() sesh: SeshDocument
    ) {
        try {
            createUserDto.password = await this.cryptService.hash(createUserDto.password);
            let user = await this.userService.create(createUserDto);
            this.emailService.sendActivationCode(user.email, user.activationCode);
            return await this.seshService.login(sesh, user);
        } catch (e) {
            throw e;
        }
    }
  
    @Delete("logout")
    @Roles(role.LOGGEDIN)
    async logout(
        @Sesh() sesh: SeshDocument
    ) {
        return await this.seshService.logout(sesh);
    }
  
    @Post("login")
    @UnsecureSesh()
    async login(      
        @Sesh() sesh: SeshDocument,
        @Body() createLoginDto: LoginDto,
    ) {
        // If email is not in the system, fail
        const user: User = await this.userService.findOneByEmail(createLoginDto.email)
        if (!user) {
            throw new HttpException("Invalid Email or Password", HttpStatus.BAD_REQUEST);
        }

        // confirm password given matches password in DB related to user
        if (!await this.cryptService.compare(createLoginDto.password, user.password)) {
            throw new HttpException("Invalid Email or Password", HttpStatus.BAD_REQUEST);
        } else {
            // login
            return await this.seshService.login(sesh, user);
        }
    }
  
    @Get("load")
    @UnsecureSesh()
    async load(
        @Sesh() sesh: SeshDocument
    ) {
        //the sesh is made in the sesh guard if it does not exist.
        return sesh;
    }

    @Get("state/switch")
    @Roles(
        role.LOGGEDIN,
        role.ACTIVATED,
    )
    async switchState (
        @Sesh() sesh: SeshDocument,
        @Query() query: {
            event: id,
        }
    ) {
        let eventId = null;
        if (query) {
            eventId = query.event;
        }

        return await this.seshService.switchState(sesh, eventId);
    }
}