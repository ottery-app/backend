import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common';
import { FormFieldService } from './form.service';
import { FormFlag } from './form.flag.enum';

@Controller('api/form')
export class FormController {
    constructor(
        private formFieldService: FormFieldService,
    ) {}

    @Get("fields/default")
    async getAllDefaultFormFields() {
        try {
            return await this.formFieldService.getAllDefault();
        } catch (e) {
            throw e;
        }
    }

    @Get("fields/base/required")
    async getAllBaseRequiredField(
        @Query("flag") flag: FormFlag
    ) {
        if (!flag) {
            throw new HttpException(
                "needs flag query",
                HttpStatus.BAD_REQUEST,
            )
        }

        try {
            const forms = await this.formFieldService.getBaseFields();
            return forms[flag];
        } catch (e) {
            throw e;
        }
    }
}