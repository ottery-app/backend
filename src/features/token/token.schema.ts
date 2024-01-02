import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { id } from '@ottery/ottery-dto';
import { Document, now } from 'mongoose';

export enum TokenType {
  RESET_PASSWORD = 'RESET_PASSWORD',
  INVITE_GUARDIAN_FOR_CHILD = 'INVITE_GUARDIAN_FOR_CHILD',
  INVITE_CARETAKER_TO_EVENT = "INVITE_CARETAKER_TO_EVENT",
}

export type TokenDocument = Token & Document;

@Schema()
export class Token {
  @Prop({ required:true, type: String, enum: TokenType}) //why is there a type?
  type: TokenType;

  @Prop({required: true})
  key: string;

  @Prop({required: true})
  token: string;

  @Prop({ default: Date.now, expires: 60000 })
  createdAt: Date;

  @Prop({required: true})
  createdBy: id;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
