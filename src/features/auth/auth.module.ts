import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { EmailModule } from '../email/email.module';
import { UserModule } from '../user/user.module';
import { CryptModule } from '../crypt/crypt.module';
import { SeshModule } from '../sesh/sesh.module';

@Module({
  imports: [
    EmailModule,
    SeshModule,
    UserModule,
    CryptModule,
  ],
  controllers: [AuthController],
  providers: [],
  exports: []
})
export class AuthModule {}
