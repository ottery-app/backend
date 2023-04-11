import { Controller, Param, Headers, Body, Post, Get, Query, Patch } from '@nestjs/common';
import { id, MessageDto } from 'ottery-dto';
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
        @Param("chatId") chatId: id,
        @Body() message: string,
    ) {
       const selfId = this.seshService.getSeshInfo(seshId).userId;
       const msg = new MessageDto(selfId, message);
       return await this.messageService.sendMessage(chatId, msg);
    }

    @Get('chat')
    async getChat(
        @Query("chatId") chatId: id,
        @Query("userIds") userIds: id[],
    ) {
        let chat;
        if (chatId) {
            chat = await this.messageService.getById(chatId);
        } else if (userIds) {
            chat = await this.messageService.getByUsers(userIds);
        }

        if (chat) {

        } else {
            if (chatId) {

            } else if (userIds) {
                
            } 
        }
    }
}