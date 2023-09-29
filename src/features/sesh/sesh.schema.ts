import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { id, time, token, role, noId, email } from 'ottery-dto';

export type SeshDocument = Sesh & Document;

@Schema()
export class Sesh {
    _id: id;

    @Prop({required: true})
    start: time = new Date().getTime();

    @Prop({required: false})
    loggedin: boolean = false;

    @Prop({required: false})
    token: token;

    @Prop({required: true})
    activated: boolean = false;

    @Prop({required: true})
    state: role.GUARDIAN | role.CARETAKER = role.GUARDIAN;

    @Prop({required: true})
    event: token = noId; 

    @Prop({required: true})
    userId: token = noId;

    @Prop({required: false})
    email: email;
}

export const SeshSchema = SchemaFactory.createForClass(Sesh);