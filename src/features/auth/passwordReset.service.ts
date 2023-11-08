import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PasswordResetToken,
  PasswordResetTokenDocument,
} from './passwordResetToken.schema';
import { Model, now } from 'mongoose';
import { EmailDto, ResetPasswordDto } from '@ottery/ottery-dto';
import { UserService } from '../user/user.service';
import { CryptService } from '../crypt/crypt.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectModel(PasswordResetToken.name)
    private passwordResetTokenModel: Model<PasswordResetTokenDocument>,
    private userService: UserService,
    private cryptService: CryptService,
    private emailService: EmailService,
  ) {}

  async setPasswordResetToken(emailDto: EmailDto) {
    const email = emailDto.email;

    const user = await this.userService.findOneByEmail(email);
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
    const token = this.cryptService.makeCode(32);
    const hash = await this.cryptService.hash(token);

    await this.passwordResetTokenModel.create({
      email,
      token: hash,
      createdAt: now(),
    });

    // Send password reset link to the user
    const link = `${process.env.CLIENT_WEB_APP_URL}/reset-password?token=${hash}&email=${email}`;

    return this.emailService.sendPasswordResetLink(email, link);
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

    const hash = await this.cryptService.hash(password);

    await this.userService.setPasswordByEmail(email, hash);
    await this.passwordResetTokenModel.deleteOne();

    return 'success';
  }
}
