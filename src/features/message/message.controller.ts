import {
  Controller,
  Param,
  Body,
  Get,
  Patch,
  Put,
  Query,
} from '@nestjs/common';
import {
  id,
  MakeChatDto,
  MessageDto,
  StringDto,
  classifyDto,
  isId,
} from '@ottery/ottery-dto';

import { MessageService } from './message.service';
import { ArrayValidationPipe } from 'src/pipes/ArrayValidationPipe';
import { SeshDocument } from '../auth/sesh/sesh.schema';
import { Sesh } from '../auth/sesh/Sesh.decorator';
import { UserService } from '../core/user/user.service';

@Controller('api/message')
export class MessageController {
  constructor(
    private messageService: MessageService,
    private userService: UserService,
  ) {}

  @Patch('chat/direct/:chatId')
  async sendMessage(
    @Sesh() sesh: SeshDocument,
    @Param('chatId') chatId: id,
    @Body() message: StringDto,
  ) {
    const selfId = sesh.userId.toString();
    const msg = new MessageDto(selfId, message.string);
    classifyDto(msg, { throw: true });
    return await this.messageService.sendMessage(chatId, msg);
  }

  @Get('chat/:chatId')
  async getChat(@Param('chatId') chatId: id) {
    return await this.messageService.getById(chatId);
  }

  @Get('user/:userId')
  async getChatsFor(
    @Param('userId') userId: id,
    @Query('requireUserIds', ArrayValidationPipe(isId)) requireUserIds: id[],
    @Query('direct') direct: boolean,
  ) {
    const chatIds = await this.userService.getChatsFor(userId);
    let chats = await this.messageService.getManyByIds(chatIds);

    if (requireUserIds?.length) {
      chats = chats.filter((chat) =>
        requireUserIds.every((id) => chat.users.includes(id)),
      );
    }

    if (direct) {
      chats = chats.filter((chat) => chat.users.length === 2);
    }

    return chats;
  }

  @Put('chat/')
  async makeChatWith(@Body() makeChatDto: MakeChatDto) {
    return await this.messageService.makeChat(makeChatDto);
  }
}
