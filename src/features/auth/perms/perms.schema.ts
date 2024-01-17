import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { id, perm } from '@ottery/ottery-dto';

export type PermsDocument = Perms & Document;

@Schema()
export class Perms {
    _id: id;

    @Prop({required: true})
    perms: perm[];

    @Prop({required: true})
    owner:id;

    @Prop({required: true})
    ownee: id;
}

export const PermsSchema = SchemaFactory.createForClass(Perms);