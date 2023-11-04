import { id, perm } from "@ottery/ottery-dto"

export interface PermissionAble {
    perms: PermLink[]
}

export interface PermLink {
    id: id,
    perms: perm[],
}