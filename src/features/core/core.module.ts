import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CryptModule } from '../crypt/crypt.module';
import { TokenModule } from '../token/token.module';
import { AlertModule } from '../alert/alert.module';
import { ImageFileModule } from '../images/imageFile.module';
import { LocatableModule } from '../location/locatable/locatable.module';

import { UserService } from './user/user.service';
import { EventService } from './event/event.service';
import { ChildService } from './child/child.service';
import { CoreService } from './core.service';

import { UserController } from './user/user.controller';
import { EventController } from './event/event.controller';
import { ChildController } from './child/child.controller';

import { User, UserSchema } from './user/user.schema';
import { EventSchema } from './event/event.schema';
import { Child, ChildSchema } from './child/child.schema';

@Module({
  imports: [
    ImageFileModule,
    LocatableModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Event.name, schema: EventSchema },
      { name: Child.name, schema: ChildSchema },
    ]),
    CryptModule,
    TokenModule,
    AlertModule,
  ],
  controllers: [UserController, EventController, ChildController],
  providers: [UserService, EventService, ChildService, CoreService],
  exports: [CoreService],
})
export class CoreModule {}
