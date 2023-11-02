import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, now } from 'mongoose';

export type PasswordResetTokenDocument = PasswordResetToken & Document;

@Schema()
export class PasswordResetToken {
  @Prop()
  email: string;

  @Prop()
  token: string;

  @Prop({ default: now(), expires: 3600 })
  createdAt: Date;
}

export const PasswordResetTokenSchema =
  SchemaFactory.createForClass(PasswordResetToken);
