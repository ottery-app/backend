import { Module } from '@nestjs/common';
import { DataService } from "./data.service";
import { FormModule } from '../form/form.module';

@Module({
  imports: [FormModule],
  controllers: [],
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}