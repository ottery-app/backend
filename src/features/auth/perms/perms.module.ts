import { Module } from '@nestjs/common';
import { PermsService } from './perms.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PermsService],
  exports: [PermsService],
})
export class PermsModule {}
