
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SocialLinkHistoryDto, id } from '@ottery/ottery-dto';
import { User } from '../core/user/user.schema';
import { Schema as MongooseSchema } from 'mongoose';

export type SocialLinkDocument = SocialLink & Document;

@Schema()
export class SocialLink {
  /**
   * the id that is generated by mongo
   */
  _id: id;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: User.name }], required:true})
  users: id[]; //this should only be two users

  @Prop({required:true})
  history: SocialLinkHistoryDto[];
}

export const SocialLinkSchema = SchemaFactory.createForClass(SocialLink);