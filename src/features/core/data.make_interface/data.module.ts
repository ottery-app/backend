import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormModule } from '../../form/form.module';
import { DataController } from './data.controller';
import { Data, DataSchema } from './data.schema';
import { DataService } from "./data.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Data.name, schema: DataSchema }]),
    FormModule,
  ],
  controllers: [DataController],
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}