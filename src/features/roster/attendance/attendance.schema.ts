import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  id,
  attendanceType,
} from '@ottery/ottery-dto';

export type AttendanceDocument = Attendance & Document;

@Schema()
export class Attendance {
  _id: id;

  @Prop({ required: true })
  event: id;

  @Prop({ required: true })
  child: id;

  @Prop({ required:true })
  date: number;

  @Prop({ required: true })
  status: attendanceType;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
