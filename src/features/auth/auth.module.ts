import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { CryptModule } from '../crypt/crypt.module';
import { SeshModule } from '../sesh/sesh.module';
import { AlertModule } from '../alert/alert.module';

@Module({
  imports: [
    AlertModule,
    SeshModule,
    UserModule,
    CryptModule,
  ],
  controllers: [AuthController],
  providers: [],
  exports: []
})
export class AuthModule {}
