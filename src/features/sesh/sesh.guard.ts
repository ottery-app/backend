
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
  async canActivate(context: ExecutionContext) {
    const ignore = this.reflector.get<string[]>('ignore-sesh-security', context.getHandler());

    const request = context.switchToHttp().getRequest();

    const id = request.headers.id;
    const authorization = request.headers.authorization;

    if (!id || id === undefined || id === null || id === "") {
      const sesh = await this.seshService.create();
      request.sesh = sesh;
    } else if (ignore) {
      const sesh = await this.seshService.getSeshInfo(id);
      request.sesh = sesh;
    } else {
      const sesh = await this.seshService.safelyGet(id, authorization);
      request.sesh = sesh;
    }

    return true;
  }
}

export const SeshGuardProvider = {
  provide: APP_GUARD,
  useClass: SeshGuard,
}