import { Module } from '@nestjs/common';
import { DataService } from "./data.service";
import { FormModule } from '../form/form.module';
import { ImageFileModule } from '../images/imageFile.module';

@Module({
  imports: [
    FormModule,
    ImageFileModule,
  ],
  controllers: [],
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}