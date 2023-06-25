import { Controller, Param, Headers, Body, Post, Get, Query, Patch } from '@nestjs/common';
import { id, MessageDto, noId, StringDto } from 'ottery-dto';
import { SeshService } from '../sesh/sesh.service';
import { MessageService } from './message.service';

@Controller('api/message')
export class MessageController {
    constructor(
        private seshService: SeshService,
        private messageService: MessageService,
    ) {}

    @Patch('chat/:userId/:from')
    async sendMessage(
        @Headers('Id') seshId: id,
        @Param("userId") userId: id,
        @Body() message: StringDto
    ) {
        const selfId = this.seshService.getSeshInfo(seshId).userId;
        const msg = new MessageDto(selfId, message.string);
        return await this.messageService.sendMessage(userId, msg);
    }

    @Get('chat/:chatId')
    async getChat(
        @Param("chatId") chatId: id
    ) {
        return await this.messageService.getById(chatId)
    }

    @Get('user/:userId')
    async getChatsFor(
        @Param("userId") userId: id,
    ) {
        return await this.messageService.getForUser(userId);
    }
}