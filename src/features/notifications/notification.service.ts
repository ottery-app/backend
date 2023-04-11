import { Injectable } from '@nestjs/common';
import { Notification, NotificationDocument} from './notification.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { id, notification, NotificationDto } from 'ottery-dto';
import { UserService } from '../user/user.service';
import { User } from '../user/user.schema';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        private userService: UserService,
    ){}

    private async makeDocumentFor(id:id) {
        const notif = new this.notificationModel({
            user:id,
            notifications:[],
        });

        return await notif.save();
    }

    private async getDocumentByUser(id:id) {
        const doc = await this.notificationModel.findOne({user:id});

        if (doc) {
            return doc;
        } else {
            return await this.makeDocumentFor(id);
        }
    }

    async sendFriendrequest(from:id, to:id) {
        const user = await this.userService.findOneById(from);

        return await this.send(
            from,
            to,
            `${user.firstName} ${user.lastName} sent you a friend request`,
            notification.friendrequest,
        );
    }

    async send(from:id, to:id, message: string, type: notification) {
        const notifications = await this.getDocumentByUser(to);
        notifications.notifications.unshift({
            sender:{
                id:from,
                ref:User.name,
            },
            message,
            type,
            time: new Date().getTime(),
        })

        return await notifications.save();
    }

    async getNotificationsByUser(userId:id) {
        return (await this.getDocumentByUser(userId)).notifications;
    }
}