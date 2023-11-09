import { Module } from '@nestjs/common';
import { UserService } from './user/user.service';
import { ChildService } from './child/child.service';
import { EventService } from './event/event.service';
import { UserController } from './user/user.controller';
import { ChildController } from './child/child.controller';
import { EventController } from './event/event.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user/user.schema';
import { Child, ChildSchema } from './child/child.schema';
import { EventSchema } from './event/event.schema';
import { CoreService } from './core.service';
import { ImageFileModule } from '../images/imageFile.module';

@Module({
  imports: [
    ImageFileModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Child.name, schema: ChildSchema }]),
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
  ],
  controllers: [
    UserController,
    ChildController,
    EventController,
  ],
  providers: [
    CoreService,

    UserService,
    ChildService,
    EventService,
  ],
  exports: [
    CoreService
  ],
})
export class CoreModule {}