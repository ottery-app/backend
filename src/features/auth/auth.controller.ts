import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  HttpException,
  HttpStatus,
  Query,
  Param,
} from '@nestjs/common';

import { ACTIVATION_CODE_LENGTH } from '../crypt/crypt.types';
import { User } from '../core/user/user.schema';
import {
  ActivationCodeDto,
  id,
  NewUserDto,
  LoginDto,
  role,
  EmailDto,
  ResetPasswordDto,
  noId,
} from '@ottery/ottery-dto';
import { Roles } from './roles/roles.decorator';
import { UnsecureSesh } from './sesh/UnsecureSesh.decorator';
import { Sesh } from './sesh/Sesh.decorator';
import { SeshDocument } from './sesh/sesh.schema';
import { AlertService } from '../alert/alert.service';
import { AuthService } from './auth.services';
import { CreateUserDto } from '../core/user/CreateUserDto';
import { PasswordResetService } from './passwordReset.service';
import { CoreService } from '../core/core.service';

@Controller('api/auth')
export class AuthController {
  constructor(
    private coreService: CoreService,
    private alertService: AlertService,
    private authService: AuthService,
    private passwordResetTokenService: PasswordResetService,
  ) {}

  @Put('resend')
  @Roles(role.LOGGEDIN)
  async resendEmail(@Sesh() sesh: SeshDocument) {
    try {
      const user = await this.coreService.user.get(sesh.userId);

      if (user.activated) {
        throw new HttpException(
          'Account already activated',
          HttpStatus.BAD_REQUEST,
        );
      }

      user.activationCode = this.authService.crypt.makeCode(
        ACTIVATION_CODE_LENGTH,
      );
      this.coreService.user.update(user._id, user);

      this.alertService.accountActivation(user.email, user.activationCode);
    } catch (e) {
      throw e;
    }
  }

  @Put('activate')
  @Roles(role.LOGGEDIN)
  async activateAccount(
    @Sesh() sesh: SeshDocument,
    @Body() createActivateDto: ActivationCodeDto,
  ) {
    try {
      await this.coreService.user.activate(sesh.userId, createActivateDto.code);
      return await this.authService.sesh.activate(sesh);
    } catch (e) {
      throw e;
    }
  }

  @Post('register')
  @UnsecureSesh()
  async register(@Body() newUserDto: NewUserDto, @Sesh() sesh: SeshDocument) {
    try {
      const createUserDto: CreateUserDto = {
        ...newUserDto,
        password: await this.authService.crypt.hash(newUserDto.password),
        activated: false,
        activationCode: this.authService.crypt.makeCode(ACTIVATION_CODE_LENGTH),
        roles: [role.GUARDIAN, role.CARETAKER],
      };

      const user = await this.coreService.user.create(createUserDto);

      this.alertService.accountActivation(user.email, user.activationCode);

      return await this.authService.sesh.login(sesh, user);
    } catch (e) {
      throw e;
    }
  }

  @Delete('logout')
  @Roles(role.LOGGEDIN)
  async logout(@Sesh() sesh: SeshDocument) {
    return await this.authService.sesh.logout(sesh);
  }

  @Post('login')
  @UnsecureSesh()
  async login(@Sesh() sesh: SeshDocument, @Body() createLoginDto: LoginDto) {
    // If email is not in the system, fail
    const user: User = await this.coreService.user.getByEmail(
      createLoginDto.email,
    );
    if (!user) {
      throw new HttpException(
        'Invalid Email or Password',
        HttpStatus.BAD_REQUEST,
      );
    }

    // confirm password given matches password in DB related to user
    if (
      !(await this.authService.crypt.compare(
        createLoginDto.password,
        user.password,
      ))
    ) {
      throw new HttpException(
        'Invalid Email or Password',
        HttpStatus.BAD_REQUEST,
      );
    } else {
      // login
      return await this.authService.sesh.login(sesh, user);
    }
  }

  @Get('load')
  @UnsecureSesh()
  async load(@Sesh() sesh: SeshDocument) {
    //the sesh is made in the sesh guard if it does not exist.
    return sesh;
  }

  @Get('state/switch')
  @Roles(role.LOGGEDIN, role.ACTIVATED)
  async switchState(
    @Sesh() sesh: SeshDocument,
    @Query()
    query: {
      event: id;
    },
  ) {
    let eventId = null;

    if (query) {
      eventId = query.event;
    }

    const event = await this.coreService.event.get(eventId);

    if (eventId !== noId && event?.volenteers && !event.volenteers.includes(sesh.userId)) {
      throw new HttpException(
        'Not a registered volenteer',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.authService.sesh.switchState(sesh, eventId);
  }

  @Post('forgot-password')
  @UnsecureSesh()
  async storePasswordResetToken(@Body() emailDto: EmailDto) {
    return this.passwordResetTokenService.setPasswordResetToken(emailDto);
  }

  @Post('reset-password')
  @UnsecureSesh()
  async storeNewPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.passwordResetTokenService.setNewPassword(resetPasswordDto);
  }
}
