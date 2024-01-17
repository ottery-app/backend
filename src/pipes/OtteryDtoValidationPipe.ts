import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { classifyWithDto, isDto, trimDto } from '@ottery/ottery-dto';
import { transform } from './dtoValidatoionTransform';

@Injectable()
export class OtteryDtoValidationPipe implements PipeTransform {
  constructor() {}

  transform(value: any, metadata: ArgumentMetadata) {
    return transform(value, metadata);
  }
}
