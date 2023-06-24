import { Controller, Param, Headers, Body, Post, Get, Query, Patch } from '@nestjs/common';
import { id, MessageDto, noId } from 'ottery-dto';
import { SeshService } from '../sesh/sesh.service';
import { MessageService } from './message.service';

@Controller('api/message')
export class MessageController {
    constructor(
        private seshService: SeshService,
        private messageService: MessageService,
    ) {}

    @Patch('chat/:chatId')
    async sendMessage(
        @Headers('Id') seshId: id,
        @Param("chatId") chatId: id = noId,
        @Body() message: string,
    ) {
       const selfId = this.seshService.getSeshInfo(seshId).userId;
       const msg = new MessageDto(selfId, message);
       return await this.messageService.sendMessage(chatId, msg);
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
        //THIS can just get chats from the user scema
        return await this.messageService.getForUser(userId);
    }
}