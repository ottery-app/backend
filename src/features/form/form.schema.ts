import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { id, noId } from '@ottery/ottery-dto';
import { FormFlag } from './form.flag.enum';

export type FormFieldDocument = FormField & Document;

@Schema()
export class FormField {
    _id: id;

    @Prop({required: true})
    label: string;

    @Prop({required: true})
    type: string;

    @Prop({required: true})
    note: string;

    @Prop({required: false, default: []})
    baseFor: FormFlag[];

    @Prop({required: false, default: noId})
    forEvent: id;

    @Prop({required: true, default: false})
    permanent: boolean;
}

export const FormFieldSchema = SchemaFactory.createForClass(FormField);