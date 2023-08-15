import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { id, requestStatus, requestType } from 'ottery-dto';

export type ChildReqeustDocument = ChildReqeust & Document;

@Schema()
export class ChildReqeust {
    _id: id;

    @Prop({required: true})
    child: id;

    @Prop({required: true})
    event: id;

    @Prop({required: true})
    guardian: id;

    @Prop({required: true})
    status: requestStatus;

    @Prop({required: true})
    type: requestType;
}

export const ChildReqeustSchema = SchemaFactory.createForClass(ChildReqeust);