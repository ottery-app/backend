import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationService } from '../notifications/notification.service';
import { UserService } from '../user/user.service';
import { Chat, ChatDocument } from './chat.shema';
import { MessageDto, id } from 'ottery-dto';
import { normalizeId } from 'src/functions/normalizeId';

@Injectable()
export class MessageService {

    constructor(
        @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
        private userService: UserService,
        private notificationService: NotificationService,
    ) {}

    private async makeChat(users:id[]) {
        const chat = new this.chatModel({
            users: users.map(normalizeId),
            messages: []
        });


        const res = await chat.save();

        const userDocs = await this.userService.findManyById(users);
        for (let i = 0; i < userDocs.length; i++) {
            userDocs[i].chats.push(res._id);
            userDocs[i].save();
        }

        return res;
    }

    async makeEmptyChat(users: id[]) {
        return await (await this.makeChat(users)).save();
    }

    async getById(chatId:id) {
        return await this.chatModel.findById(chatId);
    }

    async getByUsers(users: id[]) {
        const ids = users.map(normalizeId);
        return await this.chatModel.findOne({ users: { $all: ids } });
    }

    async getChats(userId: id) {
        const user = await this.userService.findOneById(userId);

        const chats = [];

        if (user.chats) {
            for (let i = 0; i < user.chats.length; i++) {
                chats.push(await this.chatModel.findById(user.chats[i]));
            }
        }

        return chats;
    }

    async sendMessage(userId: id, message: MessageDto) {
        let chat = await this.getByUsers([userId, message.sender]);

        if (!chat) {
            chat = await this.makeChat([userId, message.sender]);
        }

        chat.messages.push(message);
        return await chat.save();
    }
}