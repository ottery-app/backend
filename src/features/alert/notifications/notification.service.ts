import { Injectable } from '@nestjs/common';
import { Notification, NotificationDocument} from './notification.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationDto, id, perm } from '@ottery/ottery-dto';
import { PermsService } from 'src/features/auth/perms/perms.service';

@Injectable()
export class NotificationService {
    constructor(
        private permService: PermsService,
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    ){}

    private async makeDocumentFor(id:id) {
        const notif = new this.notificationModel({
            user:id,
            notifications:[],
        });

        this.permService.addPerms(id, notif._id, perm.SUPER);

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

    async send(to: id, notification: NotificationDto) {
        const notifications = await this.getDocumentByUser(to);
        notifications.notifications.unshift(notification)

        return await notifications.save();
    }

    async getNotificationsByUser(userId:id) {
        return (await this.getDocumentByUser(userId));
    }

    async markNotificationsAsRead(userId: id) {
        const notificationDoc = await this.getDocumentByUser(userId);

        for (let i in notificationDoc.notifications) {
            if (notificationDoc.notifications[i].read) {
                break;
            } else {
                notificationDoc.notifications[i] = {
                    ...notificationDoc.notifications[i],
                    read: true,
                }
            }
        }

        return await notificationDoc.save();
    }
}