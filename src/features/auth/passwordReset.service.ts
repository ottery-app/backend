import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EmailDto, ResetPasswordDto } from '@ottery/ottery-dto';

import { AuthService } from './auth.services';
import { AlertService } from '../alert/alert.service';
import { TokenService } from '../token/token.service';
import { CoreService } from '../core/core.service';

@Injectable()
export class PasswordResetService {
  constructor(
    private coreService: CoreService,
    private alertService: AlertService,
    private tokenService: TokenService,
    private authService: AuthService,
  ) {}

  async setPasswordResetToken(emailDto: EmailDto) {
    const email = emailDto.email;

    const user = await this.coreService.user.getByEmail(email);
    if (!user) {
      throw new HttpException(
        'The user with this email does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    const token = await this.tokenService.setToken(email);

    // Send password reset link to the user
    const link = `${process.env.CLIENT_WEB_APP_URL}/reset-password?token=${token}&email=${email}`;

    return this.alertService.sendPasswordResetLink(email, link);
  }

  async setNewPassword({ email, password, token }: ResetPasswordDto) {
    const dbToken = await this.tokenService.validateToken(email, token);

    const hash = await this.authService.crypt.hash(password);

    await this.coreService.user.setPasswordByEmail(email, hash);
    await dbToken.deleteOne();

    return 'success';
  }
}
