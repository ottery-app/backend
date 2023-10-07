import { SetMetadata } from "@nestjs/common";
import { role } from "@ottery/ottery-dto";

export const Roles = (...roles: role[]) => SetMetadata("roles", roles)