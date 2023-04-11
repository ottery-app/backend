import { Module } from '@nestjs/common';
import { Notification, NotificationSchema } from './notification.schema';
import { NotificationService } from './notification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from './notification.controller';
import { UserModule } from '../user/user.module';
import { SeshModule } from '../sesh/sesh.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    UserModule,
    SeshModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}