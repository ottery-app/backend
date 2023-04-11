import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { id } from 'ottery-dto';

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

    @Prop({required: true})
    permanent: boolean;

    @Prop({required: true})
    optional: boolean;
}

export const FormFieldSchema = SchemaFactory.createForClass(FormField);