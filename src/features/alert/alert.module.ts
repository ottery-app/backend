import { Module } from '@nestjs/common';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controler';
import { NotificationModule } from './notifications/notification.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    NotificationModule,
    EmailModule,
  ],
  controllers: [
    AlertController
  ],
  providers: [
    AlertService,
  ],
  exports: [AlertService]
})
export class AlertModule {}
