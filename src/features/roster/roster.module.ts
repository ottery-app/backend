import { Module } from '@nestjs/common';
import { RosterController } from './roster.controller';
import { LocatableModule } from '../locatable/locatable.module';
import { CoreModule } from '../core/core.module';
import { TempZoneModule } from './tempzone/tempzone.module';

@Module({
  imports: [TempZoneModule, LocatableModule, CoreModule],
  controllers: [RosterController],
  providers: [],
  exports: [],
})
export class RosterModule {}