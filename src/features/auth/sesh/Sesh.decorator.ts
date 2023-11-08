// Create a file, sesh.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Sesh = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.sesh; // Access the "sesh" information from the request object
  },
);
