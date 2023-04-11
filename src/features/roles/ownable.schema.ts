import { Prop, Schema } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { id, MultiSchemeDto, PermLinkDto } from "ottery-dto";

@Schema()
export class Ownee {
    _id?: id;

    @Prop({required: true})
    perms: PermLinkDto[];
}

/**
 * this is used only within the backend which is why it is not included in ottery-dto.
 * It was made so that the internal permission schema could add a perm to the ownee and then save it
 * internally reducing the repeated code
 */
export class OwneeSchemeDto extends MultiSchemeDto {
    document: Ownee & Document
}

