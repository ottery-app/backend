import { Module } from '@nestjs/common';
import { RosterController } from './roster.controller';
import { CoreModule } from '../core/core.module';
import { TempZoneModule } from './tempzone/tempzone.module';
import { TransferModule } from './transfer/transfer.module';

@Module({
  imports: [TempZoneModule, CoreModule, TransferModule],
  controllers: [RosterController],
  providers: [],
  exports: [],
})
export class RosterModule {}