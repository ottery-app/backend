import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ImageFile, ImageFileDocument } from './imageFile.scema';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ImageFileService {
    constructor(
        @InjectModel(ImageFile.name) private readonly imageFileModel: Model<ImageFileDocument>,
    ) {}

    async uploadPublicFile(dataBuffer: Buffer, filename: string) {
        const s3 = new S3();
        const uploadResult = await s3.upload({
          Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
          Body: dataBuffer,
          Key: `${uuid()}-${filename}`
        })
          .promise();
     
        const newFile = await this.imageFileModel.create({
          key: uploadResult.Key,
          url: uploadResult.Location
        });

        return await newFile.save();
    }

    async deletePublicFile(fileId: number) {
      const file = await this.imageFileModel.findById(fileId);
      const s3 = new S3();
      await s3.deleteObject({
        Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
        Key: file.key,
      }).promise();
      await this.imageFileModel.findByIdAndDelete(fileId);
    }
}