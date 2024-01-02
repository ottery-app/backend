import { DataFieldDto, ImageDto } from "@ottery/ottery-dto";

export interface DataAble {
    pfp: ImageDto;
    data: DataFieldDto[],
}