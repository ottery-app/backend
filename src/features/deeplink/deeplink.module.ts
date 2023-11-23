import { Module, Global } from '@nestjs/common';
import { DeeplinkService } from './deeplink.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [DeeplinkService],
  exports: [DeeplinkService],
})
export class DeeplinkModule {}
