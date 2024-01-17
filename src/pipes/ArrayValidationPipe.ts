import { ArgumentMetadata, mixin, PipeTransform, Type, ValidationPipe } from '@nestjs/common';
import {transform} from "./dtoValidatoionTransform";
import { memoize } from 'lodash';

export const ArrayValidationPipe: <T>(itemType: Type<T>) => Type<PipeTransform> = memoize(createArrayValidationPipe);

function createArrayValidationPipe<T>(itemType: Type<T>): Type<PipeTransform> {
  class MixinArrayValidationPipe extends ValidationPipe implements PipeTransform {

    transform(values: T[], metadata: ArgumentMetadata): Promise<any[]> {
      console.log(values, metadata);
      if (!Array.isArray(values)) {
        return values;
      }

      return Promise.all(values.map(value => transform(value, { ...metadata, metatype: itemType })));
    }
  }

  return mixin(MixinArrayValidationPipe);
}