import { Controller, Get } from '@nestjs/common';
import { FormFieldService } from './form.service';

@Controller('api/form')
export class FormController {
    constructor(
        private formFieldService: FormFieldService,
    ) {}

    // @Get("fields")
    // async getAllFormFields() {
    //     try {
    //         return await this.formFieldService.getAll();
    //     } catch (e) {
    //         throw e;
    //     }
    // }
}