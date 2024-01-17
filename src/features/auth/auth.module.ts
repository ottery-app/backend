import { Module } from '@nestjs/common';

import { SeshModule } from './sesh/sesh.module';
import { CryptModule } from '../crypt/crypt.module';
import { AlertModule } from '../alert/alert.module';
import { TokenModule } from '../token/token.module';

import { AuthController } from './auth.controller';

import { AuthService } from './auth.services';

import { PasswordResetService } from './passwordReset.service';
import { CoreModule } from '../core/core.module';
import { DeeplinkModule } from '../deeplink/deeplink.module';
import { PermsModule } from './perms/perms.module';

@Module({
  imports: [CoreModule, SeshModule, CryptModule, AlertModule, TokenModule, DeeplinkModule, PermsModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordResetService],
  exports: [AuthService],
})
export class AuthModule {}
