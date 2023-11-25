import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CryptModule } from '../crypt/crypt.module';
import { TokenModule } from '../token/token.module';
import { AlertModule } from '../alert/alert.module';
import { DeeplinkModule } from '../deeplink/deeplink.module';
import { CoreModule } from '../core/core.module';
import { InviteGuardianController } from './inviteGuardian.controler';

@Module({
  imports: [
    DeeplinkModule,
    CryptModule,
    TokenModule,
    AlertModule,
    CoreModule,
  ],
  controllers: [InviteGuardianController],
  providers: [],
  exports: [],
})
export class InviteModule {}
