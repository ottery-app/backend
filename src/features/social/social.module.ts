import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from '../alert/notifications/notification.module';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { SocialLink, SocialLinkSchema } from './socialLink.schema';
import { CoreModule } from '../core/core.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: SocialLink.name, schema: SocialLinkSchema }]),
    NotificationModule,
    CoreModule,
  ],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
