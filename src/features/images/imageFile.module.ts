import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageFile, ImageFileSchema } from './imageFile.scema';
import { ImageFileService } from './imageFile.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: ImageFile.name, schema: ImageFileSchema }]),
    ConfigModule,
  ],
  controllers: [],
  providers: [ImageFileService],
  exports: [ImageFileService],
})
export class ImageFileModule {}
