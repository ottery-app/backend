import { Injectable } from "@nestjs/common";
import { FormFieldService } from "../form/form.service";
import { DataAble } from "./data.interface";
import { DataFieldDto, ImageDto, id, inputType } from "@ottery/ottery-dto";
import { ImageFileService } from "../images/imageFile.service";

@Injectable()
export class DataService {
    constructor(
        private formService: FormFieldService,
        private imageFileService: ImageFileService,
    ) {}

    async getMissingFields(dataPage: DataAble, desired: id[]=[]) {
        const missing = desired.filter((id)=>{
            return dataPage.data.filter((data)=>data.formField == id).length === 0;
        });
        
        const ret = await this.formService.getMany(missing);
        return ret;
    }

    async update(dataPage: DataAble, data: DataFieldDto[]) {
        const filteredData = dataPage.data.filter((storedData: DataFieldDto) => {
            for (let i = 0; i < data.length; i++) {
                if (storedData.formField === data[i].formField) {
                    return false;
                }
            }

            return true;
        });

        for (let i = 0; i < data.length; i++) {
            if (data[i].type === inputType.PICTURE) {
                const image: ImageDto = data[i].value;
                const res = await this.imageFileService.uploadPublicFile(image.src);
                image.src = res.url;
            }
        }

        const res = [...filteredData, ...data];

        return res;
    }
}
