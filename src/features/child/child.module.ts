import { forwardRef, Module } from '@nestjs/common';
import { Child, ChildSchema } from './child.schema';
import { ChildService } from './child.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChildController } from './child.controller';
import { UserModule } from '../user/user.module';
import { DataModule } from '../data/data.module';
import { PermsModule } from '../roles/perms.module';
import { LocatableModule } from '../locatable/locatable.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Child.name, schema: ChildSchema }]),
    DataModule,
    PermsModule,
    LocatableModule,
    forwardRef(() => UserModule),
  ],
  controllers: [ChildController],
  providers: [
    ChildService
  ],
  exports: [ChildService],
})
export class ChildModule {}