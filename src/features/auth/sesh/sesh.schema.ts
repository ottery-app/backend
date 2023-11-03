import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { id, time, token, role, email } from '@ottery/ottery-dto';

export type SeshDocument = Sesh & Document;

@Schema()
export class Sesh {
    _id: id;

    @Prop({required: true})
    start: time;

    @Prop({required: true})
    loggedin: boolean;

    @Prop({required: true})
    token: token;

    @Prop({required: true})
    activated: boolean;

    @Prop({required: true})
    state: role.GUARDIAN | role.CARETAKER;

    @Prop({required: true})
    event: token; 

    @Prop({required: true})
    userId: token;

    @Prop({required: false})
    email: email;
}

export const SeshSchema = SchemaFactory.createForClass(Sesh);