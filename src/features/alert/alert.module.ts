import { Module } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { NotificationService } from './notifications/notification.service';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controler';
import { NotificationModule } from './notifications/notification.module';

@Module({
  imports: [
    NotificationModule,
  ],
  controllers: [AlertController],
  providers: [
    AlertService,
    EmailService,
  ],
  exports: [AlertService]
})
export class AlertModule {}
