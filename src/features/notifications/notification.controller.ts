import { Controller, Get, Headers, Param, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { id } from 'ottery-dto';
import { SeshService } from '../sesh/sesh.service';

@Controller('api/notifications')
export class NotificationController {
    constructor(
        private notificationService: NotificationService,
    ) {}

    @Get(":userId")
    async get(
        @Param('userId') userId: id,
    ) {
        return await this.notificationService.getNotificationsByUser(userId);
    }

    @Patch(":userId")
    async read(
        @Param('userId') userId: id,
    ) {
        return await this.notificationService.markNotificationsAsRead(userId);
    }
}