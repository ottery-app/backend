import { forwardRef, Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormController } from './form.controller';
import { FormField, FormFieldSchema } from './form.schema';
import { FormFieldService } from './form.service';
import { inputType, noId } from '@ottery/ottery-dto';
import { FormFlag } from './form.flag.enum';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FormField.name, schema: FormFieldSchema }]),
  ],
  controllers: [FormController],
  providers: [FormFieldService],
  exports: [FormFieldService],
})
export class FormModule implements OnModuleInit {
  constructor(private readonly formFieldService: FormFieldService) {}

  onModuleInit() {
    this.formFieldService.initializeFields([
      {
        _id: noId,
        label: "Security photo",
        type: inputType.PICTURE,
        note: "This is a photo for identifying who this person is",
        permanent: true,
        optional: false,
        baseFor: [FormFlag.guardian, FormFlag.caretaker, FormFlag.attendee],
      },
      {
        _id: noId,
        label: "Phone",
        type: inputType.PHONE,
        note: "This is the best phone number to contact this person.",
        permanent: true,
        optional: false,
        baseFor: [FormFlag.guardian, FormFlag.caretaker],
      }
    ]);
  }
}