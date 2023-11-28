import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CryptModule } from '../crypt/crypt.module';
import { TokenModule } from '../token/token.module';
import { AlertModule } from '../alert/alert.module';
import { DeeplinkModule } from '../deeplink/deeplink.module';
import { CoreModule } from '../core/core.module';
import { InviteGuardianController } from './inviteGuardian.controler';
import { InviteCaretakerController } from './inviteCaretaker.controler';

@Module({
  imports: [
    DeeplinkModule,
    CryptModule,
    TokenModule,
    AlertModule,
    CoreModule,
  ],
  controllers: [InviteGuardianController, InviteCaretakerController],
  providers: [],
  exports: [],
})
export class InviteModule {}
