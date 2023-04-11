import { Module } from '@nestjs/common';
import { LocatableService } from './locatable.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    LocatableService
  ],
  exports: [
    LocatableService
  ],
})
export class LocatableModule {}