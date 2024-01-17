// role.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SeshService } from '../sesh/sesh.service';

@Injectable()
export class PermMiddleware implements NestMiddleware {
  constructor(private readonly seshService: SeshService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const sesh = await this.seshService.getSeshInfo(req.headers.id as string);
    console.log(sesh?.userId);
    //console.log(res.json());
    
    //console.log(req.headers.id);
    console.log(res);

    if (true) {
      next();
    } else {
      res.status(403).json({ error: 'Unauthorized' });
    }
  }
}
