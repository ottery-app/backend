import { Module } from '@nestjs/common';
import { Event, EventSchema } from './event.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { FormModule } from '../../form/form.module';
import { DataModule } from '../../data.make_interface/data.module';
import { PermsModule } from '../../auth/perms.make_interface/perms.module';
import { AuthModule } from 'src/features/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    AuthModule,
    FormModule,
    DataModule,
    PermsModule,
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})

export class EventModule {}