import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, now } from 'mongoose';

export enum TokenType {
  RESET_PASSWORD = 'RESET_PASSWORD',
  INVITE_GUARDIAN = 'INVITE_GUARDIAN',
}

export type TokenDocument = Token & Document;

@Schema()
export class Token {
  @Prop({ type: String, enum: TokenType, default: TokenType.RESET_PASSWORD })
  type: TokenType;

  @Prop()
  email: string;

  @Prop()
  token: string;

  @Prop({ default: now(), expires: 3600 })
  createdAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
