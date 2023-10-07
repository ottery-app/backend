import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationService } from '../notifications/notification.service';
import { UserService } from '../user/user.service';
import { Chat, ChatDocument } from './chat.shema';
import { MakeChatDto, MessageDto, id } from '@ottery/ottery-dto';
import { normalizeId } from 'src/functions/normalizeId';

@Injectable()
export class MessageService {

    constructor(
        @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
        private userService: UserService,
        private notificationService: NotificationService, //TODO notify the user when a chat is updated
    ) {}

    async makeChat(chatRaw:MakeChatDto) {
        if (chatRaw.users.length > 2) {
            throw new Error("Group chats are not yet supported");
        }

        const chat = new this.chatModel({
            name: chatRaw.name,
            users: chatRaw.users.map(normalizeId),
            messages: []
        });

        const res = await chat.save();

        const userDocs = await this.userService.findManyById(chatRaw.users);
        
        for (let i = 0; i < userDocs.length; i++) {
            userDocs[i].chats.push(res._id);
            userDocs[i].save();
        }

        return res;
    }

    async getById(chatId:id) {
        return await this.chatModel.findById(chatId);
    }

    async getManyByIds(chatIds:id[]) {
        return await this.chatModel.find({ _id: { $in: chatIds } });
    }

    async getByUsers(users: id[]) {
        if (users.length > 2) {
            throw new Error("Group chats are not yet supported");
        }

        const ids = users.map(normalizeId);
        return await this.chatModel.findOne({ users: { $all: ids } });
    }

    async sendMessage(chatId: id, message: MessageDto) {
        let chat = await this.getById(chatId);
        chat.messages.push(message);
        return await chat.save();
    }
}