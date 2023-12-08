import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, now } from 'mongoose';
import { id, requestStatus, requestType } from '@ottery/ottery-dto';

export type ChildReqeustDocument = ChildReqeust & Document;

@Schema()
export class ChildReqeust {
    _id: id;

    @Prop({required: true})
    child: id;

    @Prop({required: true})
    event: id;

    @Prop({required: true})
    caretaker: id;

    @Prop({required: true})
    guardian: id;

    @Prop({required: true})
    status: requestStatus;

    @Prop({required: true})
    type: requestType;

    @Prop({ default: Date.now, expires: 600 })
    createdAt: Date;
}

export const ChildReqeustSchema = SchemaFactory.createForClass(ChildReqeust);

//86000000