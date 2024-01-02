import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EmailDto, ResetPasswordDto, noId } from '@ottery/ottery-dto';

import { AuthService } from './auth.services';
import { AlertService } from '../alert/alert.service';
import { TokenService } from '../token/token.service';
import { CoreService } from '../core/core.service';
import { DeeplinkService } from '../deeplink/deeplink.service';
import { TokenType } from '../token/token.schema';

@Injectable()
export class PasswordResetService {
  constructor(
    private coreService: CoreService,
    private alertService: AlertService,
    private tokenService: TokenService,
    private authService: AuthService,
    private deeplinkService: DeeplinkService,
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

    const token = await this.tokenService.setToken(email, TokenType.RESET_PASSWORD, noId);

    // Send password reset link to the user
    const link = this.deeplinkService.createLink("/auth/reset-password", {token, email});

    return this.alertService.sendPasswordResetLink(email, link);
  }

  async setNewPassword({ email, password, token }: ResetPasswordDto) {
    if (await this.tokenService.validateToken(email, token, TokenType.RESET_PASSWORD, true)) {
      const hash = await this.authService.crypt.hash(password);

      await this.coreService.user.setPasswordByEmail(email, hash);

      return 'success';
    };
  }
}
