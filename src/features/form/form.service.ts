import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { id } from '@ottery/ottery-dto';
import { FormFieldDto } from '@ottery/ottery-dto';
import { FormField, FormFieldDocument } from './form.schema';
import { CrudService } from '../interfaces/crud.service.inerface';
import { FormFlag } from './form.flag.enum';
import {FormFieldMap} from "./form.type";

@Injectable()
export class FormFieldService implements CrudService {
    constructor(
        @InjectModel(FormField.name) private formFieldModel: Model<FormFieldDocument>,
    ){}

    async getBaseFields(): Promise<FormFieldMap> {
        const map:FormFieldMap = {} as FormFieldMap;
        const formFields = await this.formFieldModel.find({
            baseFor: { $exists: true, $ne: [] }
        });
        Object.keys(FormFlag).forEach((flag: FormFlag)=>{
            map[flag] = [];
        })
        formFields.forEach((formField: FormField)=>{
            formField.baseFor.forEach((flag: FormFlag)=>{
                map[flag].push(formField);
            })
        })

        console.log(map)
        return map;
    }

    async update(formId: id, form: FormField) {

    }

    async getAllDefault() {
        return await this.formFieldModel.find({permanent:true});
    }

    async get(id: id) {
        return await this.formFieldModel.findById(id);
    }

    async getMany(ids:id[]): Promise<FormField[]> {
        return await Promise.all(ids.map((id)=>this.formFieldModel.findById(id)));
    }
 
    async create(customFormFieldDto: FormFieldDto & {_id?:id}) {
        const form = await this.get(customFormFieldDto._id);
        if (customFormFieldDto._id && form) {
            return form;
        } else {
            delete customFormFieldDto._id;
            return await this.formFieldModel.create(customFormFieldDto);
        }
    }

    async createMany(customFormFieldDtos: FormFieldDto[]) {
        return await Promise.all(customFormFieldDtos.map((f)=>this.create(f)));
    }

    async initializeFields(formFields: FormField[]) {
        Promise.all(formFields.map(async (formField)=>{
            const clone = {...formField, _id: undefined, baseFor: undefined};

            delete clone._id;
            delete formField._id;
            delete clone.baseFor;

            const form = await this.formFieldModel.findOne({...formField});

            if (!form) {
                await this.formFieldModel.create(formField);
            }
        }));
    }
}