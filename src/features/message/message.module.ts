import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from '../notifications/notification.module';
import { SeshModule } from '../sesh/sesh.module';
import { UserModule } from '../user/user.module';
import { Chat, ChatSchema } from './chat.shema';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    SeshModule,
    NotificationModule,
    UserModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
