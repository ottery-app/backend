import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CryptModule } from '../crypt/crypt.module';

import { UserService } from './user/user.service';
import { EventService } from './event/event.service';
import { UserController } from './user/user.controller';
import { EventController } from './event/event.controller';

import { User, UserSchema } from './user/user.schema';
import { EventSchema } from './event/event.schema';
import { CoreService } from './core.service';
import { Child, ChildSchema } from './child/child.schema';
import { ChildService } from './child/child.service';
import { TokenModule } from '../token/token.module';
import { AlertModule } from '../alert/alert.module';
import { ChildController } from './child/child.controller';

@Module({
  imports: [
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
