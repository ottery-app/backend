import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CoreModule } from 'src/features/core/core.module';
import { TempZoneService } from './tempzone.service';
import { TempZoneController } from './tempzone.controller';
import { ChildReqeust, ChildReqeustSchema } from './childRequest.schema';
import { TransferModule } from '../transfer/transfer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChildReqeust.name, schema: ChildReqeustSchema },
    ]),
    TransferModule,
    CoreModule,
  ],
  controllers: [TempZoneController],
  providers: [TempZoneService],
  exports: [TempZoneService],
})
export class TempZoneModule {}
