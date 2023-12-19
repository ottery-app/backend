import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
//import { Event, EventDocument } from './event.schema';
import { id, noId } from '@ottery/ottery-dto';
//import { CreateEventDto } from '@ottery/ottery-dto';
import { FormFieldDto } from '@ottery/ottery-dto';
import { FormField, FormFieldDocument } from './form.schema';
import { CrudService } from '../interfaces/crud.service.inerface';

@Injectable()
export class FormFieldService implements CrudService {
    constructor(
        @InjectModel(FormField.name) private formFieldModel: Model<FormFieldDocument>,
    ){}

    async update(formId: id, form: FormField) {

    }

    async getAll() {
        return await this.formFieldModel.find();
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
}