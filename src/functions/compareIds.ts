import { normalizeId } from "./normalizeId";

//this is to allow use of string ids and also mongo ObjectId()
export function compareIds(a: any, b: any) {
    a = normalizeId(a);
    b = normalizeId(b);
    return a.equals(b);
}