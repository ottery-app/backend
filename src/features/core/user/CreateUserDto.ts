import { NewUserDto, activationCode, role } from "@ottery/ottery-dto";

export interface CreateUserDto extends NewUserDto {
    activated: boolean,
    activationCode: activationCode,
    roles: role[],
}