
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { id, MessageDto } from '@ottery/ottery-dto';

export type ChatDocument = Chat & Document;

@Schema()
export class Chat {
  _id: id;

  @Prop({required:true})
  name: string;

  @Prop({required:true})
  users: id[];

  @Prop({required:true})
  messages: MessageDto[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
