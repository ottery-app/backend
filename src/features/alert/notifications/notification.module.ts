import { Module } from '@nestjs/common';
import { Notification, NotificationSchema } from './notification.schema';
import { NotificationService } from './notification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PermsModule } from 'src/features/auth/perms/perms.module';

@Module({
  imports: [
    PermsModule,
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
  ],
  controllers: [],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}