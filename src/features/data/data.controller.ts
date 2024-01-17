import {DataFieldDto, id} from "@ottery/ottery-dto";
import { Sesh } from "../auth/sesh/sesh.schema";

export interface DataController {
    getData(id:id, sesh:Sesh):Promise<any>
    getMissingData(id:id, desired:id[], sesh:Sesh):Promise<any[]>
    updateData(id:id, data:DataFieldDto[], sesh:Sesh):Promise<any>
}