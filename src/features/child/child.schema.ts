import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { id, gender, name, time, PermLinkDto, LocatableStampDto } from 'ottery-dto';
import { ImageDto } from 'ottery-dto';
import { DataAble } from '../data/data.schema';
import { SignupAble } from '../event/event.schema';
import { LocateAble } from '../locatable/locatable.interface';
import { PermAble } from '../perms/permission.schema';


export type ChildDocument = Child & Document;


@Schema()
export class Child implements PermAble, DataAble, LocateAble, SignupAble {
    _id: id;

    @Prop({required: true})
    firstName: name;

    @Prop({required: false})
    middleName: name;

    @Prop({required: true})
    lastName: name;

    @Prop({required: true})
    dateOfBirth: time;

    @Prop({required: true})
    gender: gender;

    @Prop({required: true})
    pfp: ImageDto;

    @Prop({required: true})
    //its kinda stupid to have this seperated into another service since its only accessed via this id... 
    //which means lost time. might fix later.
    perms: PermLinkDto[];

    @Prop({required: true})
    events: id[];

    @Prop({required: true})
    data: id;

    @Prop({required: true})
    lastStampedLocation: LocatableStampDto;
}

export const ChildSchema = SchemaFactory.createForClass(Child);