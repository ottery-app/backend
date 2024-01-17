import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PermsService } from './perms.service';
import { Perms, PermsSchema } from './perms.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Perms.name, schema: PermsSchema }]),
  ],
  controllers: [],
  providers: [PermsService],
  exports: [PermsService],
})
export class PermsModule {}