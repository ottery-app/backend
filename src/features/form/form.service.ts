import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
//import { Event, EventDocument } from './event.schema';
import { id } from '@ottery/ottery-dto';
//import { CreateEventDto } from '@ottery/ottery-dto';
import { CustomFormFieldDto } from '@ottery/ottery-dto';
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

    }

    async getMany(ids:id[]): Promise<FormField[]> {
        return [];
    }
 
    async create(customFormFieldDto: CustomFormFieldDto) {

    }
}