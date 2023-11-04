import { forwardRef, Module } from '@nestjs/common';
import { Child, ChildSchema } from './child.schema';
import { ChildService } from './child.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChildController } from './child.controller';
import { DataModule } from '../data.make_interface/data.module';
import { PermsModule } from '../../auth/perms.make_interface/perms.module';
import { LocatableModule } from '../../locatable/locatable.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Child.name, schema: ChildSchema }]),
    DataModule,
    PermsModule,
    LocatableModule,
  ],
  controllers: [
    ChildController
  ],
  providers: [
    ChildService
  ],
  exports: [ChildService],
})
export class ChildModule {}