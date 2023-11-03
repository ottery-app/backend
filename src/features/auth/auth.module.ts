import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CryptModule } from './crypt/crypt.module';
import { SeshModule } from './sesh/sesh.module';
import { AuthService } from './auth.services';
import { AlertModule } from '../alert/alert.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule, //TODO remove
    SeshModule,
    CryptModule,
    AlertModule,
  ],
  controllers: [
    AuthController
  ],
  providers: [
    AuthService
  ],
  exports: [
    AuthService
  ]
})
export class AuthModule {}
