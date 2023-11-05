import { CreateChildDto, id } from "@ottery/ottery-dto";

export interface CreateChild extends CreateChildDto {
    primaryGuardian: id,
}