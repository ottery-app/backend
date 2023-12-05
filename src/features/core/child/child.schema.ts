import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
  id,
  gender,
  name,
  time,
  LocatableStampDto,
  ImageDto,
  DataFieldDto,
} from '@ottery/ottery-dto';

import { SignupAble } from '../event/event.schema';
import { LocateAble } from 'src/features/locatable/locatable.interface';
import {
  PermissionAble,
  PermLink,
} from 'src/features/auth/perms/perms.interface';
import { DataAble } from 'src/features/data/data.interface';

export type ChildDocument = Child & Document;

@Schema()
export class Child implements DataAble, SignupAble, LocateAble, PermissionAble {
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

  @Prop()
  data: DataFieldDto[];  
}

export const ChildSchema = SchemaFactory.createForClass(Child);
