import { Controller, Get, Headers, Param, Patch } from '@nestjs/common';
import { id, perm } from '@ottery/ottery-dto';
import { AlertService } from './alert.service';
import { Sesh } from '../auth/sesh/Sesh.decorator';
import { SeshDocument } from '../auth/sesh/sesh.schema';
import { PermsService } from '../auth/perms/perms.service';

@Controller('api/notifications')
export class AlertController {
    constructor(
        private alertService: AlertService,
        private permService: PermsService,
    ) {}

    @Get(":userId")
    async get(
        @Sesh() sesh: SeshDocument,
        @Param('userId') userId: id,
    ) {
        const notif = await this.alertService.getNotifs(userId);
        return notif.notifications;
    }

    @Patch(":userId")
    async read(
        @Param('userId') userId: id,
    ) {
        return await this.alertService.readNotifs(userId);
    }
}