import { Module, Global } from '@nestjs/common';
import { SeshService } from './sesh.service';
import { CryptModule } from '../../crypt/crypt.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Sesh, SeshSchema } from './sesh.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sesh.name, schema: SeshSchema }]),
    CryptModule,
  ],
  controllers: [],
  providers: [SeshService],
  exports: [SeshService],
})
export class SeshModule {}
