import { Injectable } from "@nestjs/common";
import { FormFieldService } from "../form/form.service";
import { DataAble } from "./data.interface";
import { DataFieldDto, id } from "@ottery/ottery-dto";


@Injectable()
export class DataService {
    constructor(
        private formService: FormFieldService,
    ) {}

    async getMissingFields(dataPage: DataAble, desired: id[]) {
        const missing = desired.filter((id)=>{
            return dataPage.data.filter((data)=>data.formField == id).length === 0;
        });
        
        const ret = await this.formService.getMany(missing);
        return ret;
    }

    async update(dataPage: DataAble, data: DataFieldDto[]) {
        dataPage.data = dataPage.data.filter((storedData:DataFieldDto)=>
            data.find((data)=>data.formField === storedData.formField) !== undefined
        )

        return [...dataPage.data, ...data];
    }
}
