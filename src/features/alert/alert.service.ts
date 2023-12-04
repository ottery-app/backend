import { Injectable } from '@nestjs/common';
import { activationCode, email, id, notification } from '@ottery/ottery-dto';
import { EmailService } from './email/email.service';
import { NotificationService } from './notifications/notification.service';

@Injectable()
export class AlertService {
  constructor(
    private emailService: EmailService,
    private notificationService: NotificationService,
  ) {}

  async getNotifs(userId: id) {
    return await this.notificationService.getNotificationsByUser(userId);
  }

  async readNotifs(userId: id) {
    return await this.notificationService.markNotificationsAsRead(userId);
  }

  accountActivation(recipient: email, code: activationCode) {
    this.emailService.sendActivationCode(recipient, code);
  }

  friendRequest(sendterName: string, activator: id, target: id) {
    this.notificationService.send(target, {
      sender: activator,
      type: notification.friendrequest,
      message: `${sendterName} sent you a friend request`,
      time: new Date().getTime(),
      read: false,
    });
  }

  sendPasswordResetLink(recipient: email, link: string) {
    return this.emailService.sendPasswordResetLink(recipient, link);
  }

  sendInviteGuardianForChildLink(
    recipient: email,
    link: string,
    invitorName: string,
    childName: string,
  ) {
    return this.emailService.sendInviteGuardianForChildLink(
      recipient,
      link,
      invitorName,
      childName,
    );
  }

  sendInviteCaretakerToEvent(
    recipient: string,
    link:string,
    eventName: string,
  ) {
    return this.emailService.sendCaretakerInviteToEvent(
      recipient,
      link,
      eventName,
    );
  }
  
  sendInviteAttendeeToEvent(
    recipient: string,
    link:string,
    eventName: string,
  ) {
    return this.emailService.sendAttendeeInviteToEvent(
      recipient,
      link,
      eventName,
    );
  }
}
