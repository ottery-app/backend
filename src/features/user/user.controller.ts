import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseBoolPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ChildService } from '../child/child.service';
import { UserInfoDto, role } from '@ottery/ottery-dto';
import { id } from '@ottery/ottery-dto';
import { EventService } from '../event/event.service';
import { Sesh } from '../sesh/Sesh.decorator';
import { Roles } from '../roles/roles.decorator';
import { SeshDocument } from '../sesh/sesh.schema';

@Controller('api/user')
export class UserController {
  constructor(
    private childService: ChildService,
    private userService: UserService,
    private eventService: EventService,
  ) {}

  @Get(':userId/children')
  async getChildren(
    @Param('userId') userId: id,
    @Query('at') at?: string, //id
    @Query('notat') notAt?: string, //id
    @Query('hasEvent') hasEvent?: boolean,
  ) {
    try {
      const user = await this.userService.findOneById(userId);
      let children = await this.childService.findManyByIds(user.children);

      if (at) {
        children = children.filter(
          (child) => child.lastStampedLocation.at === at,
        );
      }

      if (notAt) {
        children = children.filter(
          (child) => child.lastStampedLocation.at !== notAt,
        );
      }

      if (Boolean(hasEvent) === false) {
        children = children.filter((child) => child.events.length === 0);
      }

      if (Boolean(hasEvent) === true) {
        children = children.filter((child) => child.events.length !== 0);
      }

      return children;
    } catch (e) {
      throw new HttpException(
        'Failed to get children',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':userId/events')
  async getEventsFor(
    @Param('userId') id: id,
    @Query('children', ParseBoolPipe) children = false,
    @Query('self', ParseBoolPipe) self = false,
  ) {
    try {
      const eventIds = new Set<id>();

      if (children) {
        const childIds = await this.userService.getChildrenFor(id);
        const children = await this.childService.findManyByIds(childIds);
        children.forEach((child) =>
          child.events.forEach((id) => eventIds.add(id)),
        );
      }

      if (self) {
        const events = await this.userService.getEventsFor(id);
        events.forEach((id) => eventIds.add(id));
      }

      return await this.eventService.findManyByIds(Array.from(eventIds));
    } catch (e) {
      throw e;
    }
  }

  @Get('info')
  async getInfo(@Sesh() sesh, @Query('users') userIds: id[]) {
    if (userIds === undefined) {
      userIds = [];
    }

    if (userIds.length === 0) {
      userIds.push(sesh.userId);
    }

    const users = [];

    for (let i = 0; i < userIds.length; i++) {
      const user = await this.userService.findOneById(userIds[i]);
      //make the data safe. probably could do this in a pipe?
      const userInfo = new UserInfoDto(user);
      users.push(userInfo);
    }

    return users;
  }

  @Patch('info')
  @Roles(role.LOGGEDIN)
  async updateInfo(
    @Sesh() sesh: SeshDocument,
    @Body() updateDto: Omit<UserInfoDto, '_id'>,
  ): Promise<UserInfoDto> {
    try {
      const user = await this.userService.findOneById(sesh.userId);
      Object.assign(user, updateDto);
      await this.userService.save(user);

      return new UserInfoDto(user);
    } catch (e) {
      throw e;
    }
  }

  @Get(':userId/mychildren')
  async getMyChildren(@Param('userId') userId: id) {
    try {
      const user = await this.userService.findOneById(userId);
      const userRoles = user.roles;
      const requiredPermission = 'guardian';
      if (userRoles.some((role) => role.includes(requiredPermission))) {
        const children = await this.childService.findManyByIds(user.children);
        return children;
      } else {
        throw new HttpException(
          'You do not have permission to access these children',
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (e) {
      console.error(e);
      throw new HttpException(
        'Failed to get children',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
