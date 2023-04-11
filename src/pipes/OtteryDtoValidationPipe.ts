import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { classifyWithDto } from 'ottery-dto';

@Injectable()
export class OtteryDtoValidationPipe implements PipeTransform {
  constructor() {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (value && value.password) {
      const print = {...value};
      print.password = "secret";
      console.log(print);
    } else {
      console.log(value);
    }

    if (metadata.type === "body") {
      try {
        if (!Array.isArray(new metadata.metatype())) {
          classifyWithDto(
            metadata.metatype,
            value, 
            {
              throw: true,
              forceDuckDto: true,
            }
          );
        }
      } catch (e) {
        console.log("THROW");
        throw new BadRequestException(e.message);
      }
    }

    console.log("SUCCESS");
    return value;
  }
}
