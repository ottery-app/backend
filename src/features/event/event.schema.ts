import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { id, currency, time, recurrence, location, PermLinkDto } from '@ottery/ottery-dto';
import { PermAble } from '../perms/permission.schema';

export type EventDocument = Event & Document;

export interface SignupAble {
    events: id[];
}

@Schema()
export class Event implements PermAble {
    _id?: id;

    @Prop({required: true})
    summary: string;

    @Prop({required: true})
    org: id;

    @Prop({required: true})
    description: string

    @Prop({required: true})
    start: time;

    @Prop({required: true})
    end: time;

    @Prop({required: true})
    location: location;

    @Prop({required: true})
    recurrence: recurrence[];

    @Prop({required: true})
    volenteerSignUp: id[]; //these are links to the fields 

    @Prop({required: true})
    attendeeSignUp: id[]; //these are links to the fields 

    //TODO this should also be able to be not children
    @Prop({required: true})
    attendees: id[]; //these are the children that are signed up

    @Prop({required: true})
    volenteers: id[]; //these are the people that are signed up

    @Prop({required: true})
    cost: currency.USD;

    @Prop({required: true})
    public: boolean;

    @Prop({required: true})
    perms: PermLinkDto[];
}

export const EventSchema = SchemaFactory.createForClass(Event);