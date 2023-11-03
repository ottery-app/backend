import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { id, NotificationDto } from '@ottery/ottery-dto';


export type NotificationDocument = Notification & Document; 

@Schema()
export class Notification {
    _id: id;

    @Prop({required:true})
    user: id;

    @Prop({required:true})
    notifications: NotificationDto[]
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);