import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { CryptModule } from '../crypt/crypt.module';
import { UserController } from './user.controller';
import { ChildModule } from '../child/child.module';
import { EventModule } from '../event/event.module';
import { DataModule } from '../data/data.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    CryptModule,
    DataModule,
    forwardRef(() => ChildModule),
    forwardRef(()=> EventModule ),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
