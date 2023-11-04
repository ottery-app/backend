import { Module } from '@nestjs/common';
import { TempZoneService } from './tempzone.service';
import { TempZoneController } from './tempzone.controller';
import { LocatableModule } from '../locatable/locatable.module';
import { ChildReqeust, ChildReqeustSchema } from './childRequest.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [
    LocatableModule,
    CoreModule,
    MongooseModule.forFeature([{ name: ChildReqeust.name, schema: ChildReqeustSchema }]),
  ],
  controllers: [TempZoneController],
  providers: [
    TempZoneService,
  ],
  exports: [TempZoneService],
})
export class TempZoneModule {}