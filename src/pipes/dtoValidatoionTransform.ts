import { BadRequestException, ArgumentMetadata } from "@nestjs/common";
import { classifyWithDto, isDto, trimDto } from "@ottery/ottery-dto";

function printResults(value, meta, msg) {
    if (value) {
      if (meta.data) {
        console.log(meta.type + ' ' + meta.data);
      } else {
        console.log(meta.type);
      }
  
      console.log("value: \n" + value);
      console.log("results: \n" + msg);
    }
  }

export function transform(value: any, metadata: ArgumentMetadata) {
    let print = value;

    if (value && value.password) {
      print = {...value};
      print.password = "secret";
    }

    if (metadata.type === "body") {
      try {
        if (!Array.isArray(new metadata.metatype()) && isDto(metadata.metatype)) {
          classifyWithDto(
            metadata.metatype,
            value, 
            {
              throw: true,
              forceDuckDto: true,
            }
          );
        } else {
        }
      } catch (e) {
        //printResults(print, metadata, "ERROR")
        throw new BadRequestException(e.message);
      }
    }

    //printResults(print, metadata, "SUCCESS");
    if (isDto(metadata.metatype)) {
      return trimDto(value, metadata.metatype);
    } else {
      return value;
    }
}


