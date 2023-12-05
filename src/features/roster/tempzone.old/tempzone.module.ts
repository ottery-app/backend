import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CoreModule } from 'src/features/core/core.module';
import { LocatableModule } from '../../locatable/locatable.module';
import { TempZoneService } from './tempzone.service';
import { TempZoneController } from './tempzone.controller';
import { ChildReqeust, ChildReqeustSchema } from './childRequest.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChildReqeust.name, schema: ChildReqeustSchema },
    ]),
    LocatableModule,
    CoreModule,
  ],
  controllers: [TempZoneController],
  providers: [TempZoneService],
  exports: [TempZoneService],
})
export class TempZoneModule {}
