
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { APP_GUARD } from '@nestjs/core';
import { SeshService } from '../sesh/sesh.service';

@Injectable()
export class SeshGuard implements CanActivate {
  constructor(
    private reflector:  Reflector,
    private seshService: SeshService
  ) {}

  /**
   * If a user can do a given action for their roles
   * 
   * @param context ???
   * @returns ???
   */
  canActivate(context: ExecutionContext): boolean {
    const ignore = this.reflector.get<string[]>('ignore-sesh', context.getHandler());

    if (ignore) {
        return true;
    }

    const headers = context.switchToHttp().getRequest().headers;

    const id = headers.id;
    const authorization = headers.authorization;

    return this.seshService.validateSession(id, authorization);
  }
}

export const SeshGuardProvider = {
  provide: APP_GUARD,
  useClass: SeshGuard,
}