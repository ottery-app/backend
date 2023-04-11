import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { id, MultiSchemeDto, perm, PermLinkDto } from 'ottery-dto';

export type PermsDocument = Perms & Document;

export interface PermAble {
    perms: PermLinkDto[]
}

@Schema()
export class Perms {
    _id: id;

    @Prop({required: true})
    owner: MultiSchemeDto;

    @Prop({required: true})
    ownee: MultiSchemeDto;

    @Prop({required: true})
    perms: perm[];
}

export const PermSchema = SchemaFactory.createForClass(Perms);