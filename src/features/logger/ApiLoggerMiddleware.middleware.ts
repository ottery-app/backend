import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, baseUrl } = request; // Access the route object

    const userAgent = request.get('user-agent') || '';

    response.on('close', () => {
      const { statusCode } = response;

      // Include the route name in the log output
      this.logger.log(
        `${method} ${baseUrl} ${statusCode} - ${userAgent} ${ip}`
      );
    });

    next();
  }
}