import { Controller, Get, Post, Body, Headers, Param, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { id } from 'ottery-dto';
import { Notification } from './notification.schema';
import { User } from '../user/user.schema';
import { SeshService } from '../sesh/sesh.service';

@Controller('api/notifications')
export class NotificationController {
    constructor(
        private seshService: SeshService,
        private notificationService: NotificationService,
    ) {}

    @Get(":id")
    async get(
        @Headers('Id') seshId: id,
        @Param('id') id: id,
        //@Query('children') childIds: id[]
    ) {
        return await this.notificationService.getNotificationsByUser(id);
    }
}