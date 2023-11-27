import {DataFieldDto, id} from "@ottery/ottery-dto";

export interface DataController {
    getData(id:id):Promise<any>
    getMissingData(id:id, desired:id[]):Promise<any[]>
    updateData(id:id, data:DataFieldDto[]):Promise<any>
}