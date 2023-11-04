import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from '../alert/notifications/notification.module';
import { SeshModule } from '../auth/sesh/sesh.module';
import { Chat, ChatSchema } from './chat.shema';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { CoreModule } from '../core/core.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    SeshModule,
    NotificationModule,
    CoreModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
