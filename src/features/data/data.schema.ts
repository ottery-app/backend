import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { id, DataFieldDto, MultiSchemeDto } from 'ottery-dto';
//import { Ownee } from '../roles/Ownable.schema';


export type DataDocument = Data & Document;


export interface DataAble {
    //just a link to the data
    data: id;
};

@Schema()
export class Data {
    _id: id;

    @Prop({required: true})
    owner: MultiSchemeDto;

    @Prop({required: true})
    data: DataFieldDto[];
}

export const DataSchema = SchemaFactory.createForClass(Data);