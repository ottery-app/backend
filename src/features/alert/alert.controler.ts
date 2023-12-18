import { Controller, Get, Headers, Param, Patch } from '@nestjs/common';
import { id } from '@ottery/ottery-dto';
import { AlertService } from './alert.service';

@Controller('api/notifications')
export class AlertController {
    constructor(
        private alertService: AlertService,
    ) {}

    @Get(":userId")
    async get(
        @Param('userId') userId: id,
    ) {
        return await this.alertService.getNotifs(userId);
    }

    @Patch(":userId")
    async read(
        @Param('userId') userId: id,
    ) {
        return await this.alertService.readNotifs(userId);
    }
}