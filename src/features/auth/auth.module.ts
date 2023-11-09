import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthController } from './auth.controller';
import { SeshModule } from './sesh/sesh.module';
import { CryptModule } from './crypt/crypt.module';
import { AuthService } from './auth.services';
import { AlertModule } from '../alert/alert.module';
import { CoreModule } from '../core/core.module';

import {
  PasswordResetToken,
  PasswordResetTokenSchema,
} from './passwordResetToken.schema';
import { PasswordResetService } from './passwordReset.service';
@Module({
  imports: [
    CoreModule, //TODO remove
    SeshModule,
    CryptModule,
    AlertModule,
    MongooseModule.forFeature([
      { name: PasswordResetToken.name, schema: PasswordResetTokenSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordResetService],
  exports: [AuthService],
})
export class AuthModule {}
