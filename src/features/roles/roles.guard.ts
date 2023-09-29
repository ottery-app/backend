
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { APP_GUARD } from '@nestjs/core';
import { SeshService } from '../sesh/sesh.service';
import { role } from 'ottery-dto';

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

    const sesh = context.switchToHttp().getRequest().sesh;

    for (let check of roles) {
      switch(check) {
        case role.LOGGEDIN:
          if (!this.seshService.isLoggedin(sesh)) {
            return false;
          }
          break;
        case role.ACTIVATED:
          if (!this.seshService.isActivated(sesh)) {
            return false;
          }
          break;
        case role.CARETAKER:
          if (!this.seshService.isCaretaker(sesh)) {
            return false;
          }
          break;
        case role.GUARDIAN:
          if (!this.seshService.isGuardian(sesh)) {
            return false;
          }
          break;
      }
    }

    return true;
  }
}

export const RolesGuardProvider = {
  provide: APP_GUARD,
  useClass: RolesGuard,
}