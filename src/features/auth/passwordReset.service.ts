import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  PasswordResetToken,
  PasswordResetTokenDocument,
} from './passwordResetToken.schema';
import { Model, now } from 'mongoose';
import { EmailDto, ResetPasswordDto } from '@ottery/ottery-dto';
import { CoreService } from '../core/core.service';
import { AuthService } from './auth.services';
import { AlertService } from '../alert/alert.service';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectModel(PasswordResetToken.name)
    private passwordResetTokenModel: Model<PasswordResetTokenDocument>,
    private coreService: CoreService,
    private authService: AuthService,
    private alertService: AlertService,
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

    if (await this.passwordResetTokenModel.findOne({ email: email })) {
      await this.passwordResetTokenModel.deleteOne({ email: email });
    }

    // Create a reset token and save
    const token = this.authService.crypt.makeCode(32);
    const hash = await this.authService.crypt.hash(token);

    await this.passwordResetTokenModel.create({
      email,
      token: hash,
      createdAt: now(),
    });

    // Send password reset link to the user
    const link = `${process.env.CLIENT_WEB_APP_URL}/reset-password?token=${hash}&email=${email}`;

    return this.alertService.sendPasswordResetLink(email, link);
  }

  async setNewPassword({ email, password, token }: ResetPasswordDto) {
    // Check token's validity
    const dbToken = await this.passwordResetTokenModel.findOne({
      email,
    });

    if (!dbToken) {
      throw new HttpException(
        'Invalid or expired password reset token',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (token !== dbToken.token) {
      throw new HttpException(
        'Invalid password reset token',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hash = await this.authService.crypt.hash(password);

    await this.coreService.user.setPasswordByEmail(email, hash);
    await this.passwordResetTokenModel.deleteOne();

    return 'success';
  }
}
