import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
//import { Event, EventDocument } from './event.schema';
import { id } from 'ottery-dto';
//import { CreateEventDto } from 'ottery-dto';
import { CustomFormFieldDto } from 'ottery-dto';
import { FormField, FormFieldDocument } from './formField.schema';

@Injectable()
export class FormFieldService {
    constructor(
        @InjectModel(FormField.name) private formFieldModel: Model<FormFieldDocument>,
    ){}

    async create(customFormFieldDto: CustomFormFieldDto) {
        return (await this.findOneByProps(customFormFieldDto))[0]
            || await this.formFieldModel.create(customFormFieldDto);
    }

    async createMany(customFormFields: CustomFormFieldDto[]): Promise<id[]> {
        const ids = [];
        for (let i = 0; i < customFormFields.length; i++) {
            ids.push((await this.create(customFormFields[i]))._id);
        }
        return ids;
    }

    async getAll() {
        return await this.formFieldModel.find();
    }

    async findOneByLabel(label: String) {
        const found = await this.formFieldModel.findOne({label});

        if (!found) {
            throw new NotFoundException();
        } else {
            return found;
        }
    }

    async findOneByProps(customFormFieldDto: CustomFormFieldDto) {
        return await this.formFieldModel.find(customFormFieldDto);
    }

    async findOneById(id: id) {
        const found = await this.formFieldModel.findById(id);

        if (!found) {
            throw new NotFoundException();
        } else {
            return found;
        }
    }

    async findManyByIds(ids: id[]) {
        return await this.formFieldModel.find({'_id': { $in: ids }});
    }
}