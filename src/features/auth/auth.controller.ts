import { Controller, Get, Post, Put, Delete, Body, Headers, HttpException, HttpStatus, Query } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { SeshService } from '../sesh/sesh.service';
import { Sesh } from '../sesh/sesh.class';
import { UserService } from '../user/user.service';
import { CryptService } from '../crypt/crypt.service';
import { ACTIVATION_CODE_LENGTH } from '../crypt/crypt.types';
import { User } from '../user/user.schema';
import {ActivationCodeDto, NewUserDto, LoginDto, noId, perm, role} from "ottery-dto";
import { token, id } from 'ottery-dto';
import { Roles } from '../roles/roles.decorator';
import { Seshless } from '../sesh/sesh.decorator';

@Controller('api/auth')
export class AuthController {
    constructor(
        private emailService: EmailService,
        private seshService: SeshService,
        private userService: UserService,
        private cryptService: CryptService,
    ) {}

    @Put("resend")
    async resendEmail(
        @Headers('Id') seshId: id,
    ) {
        try {
            const user = await this.userService.findOneById(this.seshService.getSeshInfo(seshId).userId);
            
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
    async activateAccount(
        @Headers('Id') seshId: id,
        @Body() createActivateDto: ActivationCodeDto
    ) {
        try {
            //I dont think we need to return the user
            await this.userService.activate(
                this.seshService.getSeshInfo(seshId).userId,
                createActivateDto.code
            );

            return this.seshService.activate(seshId);
        } catch (e) {
            throw e;
        }
    }
  

    @Post("register")
    async register(
        @Headers('Id') seshId: id,
        @Body() createUserDto: NewUserDto,
    ) {
        if (!this.seshService.getSeshInfo(seshId)) {
            throw new HttpException("Bad Request", HttpStatus.BAD_REQUEST);
        }

        try {
            createUserDto.password = await this.cryptService.hash(createUserDto.password);
            let user = await this.userService.create(createUserDto);
            this.emailService.sendActivationCode(user.email, user.activationCode);
            return this.seshService.login(seshId, user);
        } catch (e) {
            throw e;
        }
    }
  
    @Delete("logout")
    async logout(
        @Headers('id') seshId: id,
    ) {
        return this.seshService.logout(seshId);
    }
  
    @Post("login")
    @Seshless()
    async login(      
        @Headers('Id') seshId: id,
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
            return this.seshService.login(seshId, user);
        }
    }
  
    @Get("load")
    @Seshless()
    async load(
        @Headers('Id') seshId: id = noId,
        @Headers('Authorization') token: token,
    ) {
        let sesh: Sesh = this.seshService.getSeshInfo(seshId);

        if (sesh) { // Does the user session exists? (they may or may not be logged in)
            if (sesh.loggedin && token) { // Yes; have they logged in and do they have a valid token
                if (token !== sesh.token) { // No; the token is invalid 
                    throw new HttpException("Bad Request", HttpStatus.BAD_REQUEST);
                }

                return sesh; // Yes; the token is valid and they are logged in
            }

            return sesh; // Yes, the token is valid but they are not logged in
        } else { // The user is not logged in but there are no errors
            return this.seshService.create(); // No, the user session does not exist, so make a new session
        }
    }

    @Get("state/switch")
    async switchState (
        @Headers('Id') seshId: id,
        @Query() query: {
            event: id,
        }
    ) {
        let eventId = null;
        if (query) {
            eventId = query.event;
        }

        return this.seshService.switchState(seshId, eventId);
    }
}