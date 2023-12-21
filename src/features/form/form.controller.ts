import { Controller, Get, Query } from '@nestjs/common';
import { FormFieldService } from './form.service';

@Controller('api/form')
export class FormController {
    constructor(
        private formFieldService: FormFieldService,
    ) {}

    @Get("fields/default")
    async getAllDefaultFormFields(
        @Query("permanent") permanentQuery: string
    ) {
        try {
            return await this.formFieldService.getAllDefault();
        } catch (e) {
            throw e;
        }
    }
}