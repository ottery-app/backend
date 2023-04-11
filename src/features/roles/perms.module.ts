import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PermSchema, Perms } from './permission.schema';
import { PermsService } from './perms.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Perms.name, schema: PermSchema }])
  ],
  controllers: [],
  providers: [PermsService],
  exports: [PermsService],
})
export class PermsModule {}
