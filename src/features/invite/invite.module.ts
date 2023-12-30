import { Module } from '@nestjs/common';

import { CryptModule } from '../crypt/crypt.module';
import { TokenModule } from '../token/token.module';
import { AlertModule } from '../alert/alert.module';
import { DeeplinkModule } from '../deeplink/deeplink.module';
import { CoreModule } from '../core/core.module';
import { InviteGuardianController } from './inviteGuardian.controler';
import { InviteEventController } from './inviteEvent.controler';
import { FormModule } from '../form/form.module';
import { DataModule } from '../data/data.module';

@Module({
  imports: [
    DeeplinkModule,
    CryptModule,
    TokenModule,
    AlertModule,
    CoreModule,
    FormModule,
    DataModule
  ],
  controllers: [InviteGuardianController, InviteEventController],
  providers: [],
  exports: [],
})
export class InviteModule {}
