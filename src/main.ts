//import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { OtteryDtoValidationPipe } from './pipes/OtteryDtoValidationPipe';
import { urlencoded, json } from 'express';
import { config as awsconfig } from 'aws-sdk';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: undefined,
  });

  const config = new DocumentBuilder()
    .setTitle('Ottery')
    .setDescription('Ottery API')
    .setVersion('1.0')
    .addTag('ottery')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new OtteryDtoValidationPipe());
  app.enableCors();
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  awsconfig.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  await app.listen(8080);
}
bootstrap();
