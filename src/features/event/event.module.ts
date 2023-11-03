import { forwardRef, Module } from '@nestjs/common';
import { Event, EventSchema } from './event.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './event.controller';
import { UserModule } from '../user/user.module';
import { SeshModule } from '../auth/sesh/sesh.module';
import { EventService } from './event.service';
import { FormModule } from '../form/form.module';
import { DataModule } from '../data/data.module';
import { PermsModule } from '../perms/perms.module';
import { ChildModule } from '../child/child.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    SeshModule,
    FormModule,
    DataModule,
    PermsModule,
    ChildModule,
    forwardRef(()=>UserModule),
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})

export class EventModule {}