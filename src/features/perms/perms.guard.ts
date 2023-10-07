
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { APP_GUARD } from '@nestjs/core';

@Injectable()
export class PermsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
  ) {}

  /**
   * If a user can do a given action for their roles
   * 
   * @param context ???
   * @returns ???
   */
  canActivate(context: ExecutionContext): boolean {
    const perms = this.reflector.get<string[]>('perms', context.getHandler());

    // const request = context.switchToHttp().getRequest().headers;

    //TODO check that the user sesh is loggedin
    //TODO not authenticated role check
    //TODO check that the user has the correct roles
    return true;
  }
}

export const PermsGuardPrivider = {
  provide: APP_GUARD,
  useClass: PermsGuard,
}