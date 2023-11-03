import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ChildModule } from '../child/child.module';
import { EventModule } from '../event/event.module';
import { FormModule } from '../form/form.module';
import { DataModule } from '../data/data.module';
import { SocialModule } from '../social/social.module';
import { MessageModule } from '../message/message.module';
import { TempZoneModule } from '../tempzone/tempzone.module';

@Module({
  imports: [
    UserModule,
    ChildModule,
    EventModule,
    FormModule,
    DataModule,
    TempZoneModule,
    SocialModule,
    MessageModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class CoreModule {}