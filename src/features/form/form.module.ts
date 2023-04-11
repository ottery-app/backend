import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormController } from './form.controller';
import { FormField, FormFieldSchema } from './formField.schema';
import { FormFieldService } from './formField.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FormField.name, schema: FormFieldSchema }]),
  ],
  controllers: [FormController],
  providers: [FormFieldService],
  exports: [FormFieldService],
})

export class FormModule {}