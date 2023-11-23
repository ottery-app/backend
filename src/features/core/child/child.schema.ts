import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
  id,
  gender,
  name,
  time,
  LocatableStampDto,
  ImageDto,
} from '@ottery/ottery-dto';

import { SignupAble } from '../event/event.schema';
import { LocateAble } from 'src/features/location/locatable/locatable.interface';
import {
  PermissionAble,
  PermLink,
} from 'src/features/auth/perms/perms.interface';

export type ChildDocument = Child & Document;

@Schema()
export class Child implements SignupAble, LocateAble, PermissionAble {
  _id: id;

  @Prop({ required: true })
  firstName: name;

  @Prop({ required: false })
  middleName: name;

  @Prop({ required: true })
  lastName: name;

  @Prop({ required: true })
  dateOfBirth: time;

  @Prop({ required: true })
  gender: gender;

  @Prop({ required: true })
  pfp: ImageDto;

  @Prop({ required: true })
  events: id[];

  @Prop({ required: true })
  primaryGuardian: id;

  @Prop({ required: true })
  guardians: id[];

  @Prop({ required: true })
  perms: PermLink[];

  @Prop({ required: true })
  lastStampedLocation: LocatableStampDto;
}

export const ChildSchema = SchemaFactory.createForClass(Child);
