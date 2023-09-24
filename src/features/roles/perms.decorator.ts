import { SetMetadata } from "@nestjs/common";
import { perm } from "ottery-dto";

export const Perms = (owner:string, ownee:string, ...perms: perm[]) => SetMetadata("roles", perms)