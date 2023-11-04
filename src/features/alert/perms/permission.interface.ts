import { id, perm } from "@ottery/ottery-dto"

export interface Permission {
    perms: PermLink[]
}

export interface PermLink {
    id: id,
    perms: perm[],
}