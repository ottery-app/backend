import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { EmailModule } from '../email/email.module';
import { UserModule } from '../user/user.module';
import { CryptModule } from '../crypt/crypt.module';
import { SeshModule } from '../sesh/sesh.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PasswordResetToken,
  PasswordResetTokenSchema,
} from './passwordResetToken.schema';
import { PasswordResetService } from './passwordReset.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PasswordResetToken.name, schema: PasswordResetTokenSchema },
    ]),
    EmailModule,
    SeshModule,
    UserModule,
    CryptModule,
  ],
  controllers: [AuthController],
  providers: [PasswordResetService],
  exports: [],
})
export class AuthModule {}
