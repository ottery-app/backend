import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TokenService } from './token.service';
import { Token, TokenSchema } from './token.schema';
import { CryptModule } from '../crypt/crypt.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
    CryptModule,
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
