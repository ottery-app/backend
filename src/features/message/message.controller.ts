import { Controller, Param, Headers, Body, Get, Patch, Put } from '@nestjs/common';
import { id, MakeChatDto, MessageDto, StringDto, classifyDto } from 'ottery-dto';
import { SeshService } from '../sesh/sesh.service';
import { MessageService } from './message.service';
import { normalizeId } from 'src/functions/normalizeId';

@Controller('api/message')
export class MessageController {
    constructor(
        private seshService: SeshService,
        private messageService: MessageService,
    ) {}

    @Patch('chat/direct/:chatId')
    async sendMessage(
        @Headers('Id') seshId: id,
        @Param("chatId") chatId: id,
        @Body() message: StringDto
    ) {
        const selfId = this.seshService.getSeshInfo(seshId).userId.toString();
        const msg = new MessageDto(selfId, message.string);
        classifyDto(msg, {throw:true});
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
        return await this.messageService.getForUser(userId);
    }

    @Put("chat/")
    async makeChatWith(
        @Body() makeChatDto: MakeChatDto,
    ) {
        return await this.messageService.makeChat(makeChatDto);
    }
}