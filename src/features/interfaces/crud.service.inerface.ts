import { id } from "@ottery/ottery-dto";

export interface CrudService {
    create(object:any): Promise<any>;
    //delete(id:id): Promise<any>;
    update(id:id, object:any): Promise<any>;
    get(id:id): Promise<any>;
    getMany(ids:id[]): Promise<any>;
}