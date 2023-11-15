import { Module } from '@nestjs/common';
import { CryptService } from './crypt.service';

@Module({
  imports: [],
  controllers: [],
  providers: [CryptService],
  exports: [CryptService],
})
export class CryptModule {}
