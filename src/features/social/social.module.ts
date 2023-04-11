import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from '../notifications/notification.module';
import { SeshModule } from '../sesh/sesh.module';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { SocialLink, SocialLinkSchema } from './socialLink.schema';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: SocialLink.name, schema: SocialLinkSchema }]),
    SeshModule,
    NotificationModule,
    UserModule,
  ],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
