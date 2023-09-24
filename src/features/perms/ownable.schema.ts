import { Prop, Schema } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { id, MultiSchemeDto, PermLinkDto } from "ottery-dto";

@Schema()
export class Ownee {
    _id?: id;

    @Prop({required: true})
    perms: PermLinkDto[];
}

export type OwneeSchemeDto = Ownee & Document;

