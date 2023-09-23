
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { APP_GUARD } from '@nestjs/core';
import { SeshService } from '../sesh/sesh.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private seshService: SeshService
  ) {}

  /**
   * If a user can do a given action for their roles
   * 
   * @param context ???
   * @returns ???
   */
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    console.log(request);

    //TODO check that the user sesh is loggedin
    //TODO not authenticated role check
    //TODO check that the user has the correct roles
    return true;
  }
}

export const RolesGuardProvider = {
  provide: APP_GUARD,
  useClass: RolesGuard,
}