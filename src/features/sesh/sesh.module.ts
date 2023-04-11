import { Module, Global } from '@nestjs/common';
import { SeshService } from './sesh.service';
import { CryptModule } from '../crypt/crypt.module';

@Global()
@Module({
  imports: [CryptModule],
  controllers: [],
  providers: [SeshService],
  exports: [SeshService],
})
export class SeshModule {}
