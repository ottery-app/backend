import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseBoolPipe,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ChildService } from '../child/child.service';
import { UserInfoDto } from '@ottery/ottery-dto';
import { id } from '@ottery/ottery-dto';
import { EventService } from '../event/event.service';
import { Sesh } from '../../auth/sesh/Sesh.decorator';

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
      const user = await this.userService.get(userId);
      let children = await this.childService.getMany(user.children);

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
        const childIds = await this.userService.getChildren(id);
        const children = await this.childService.getMany(childIds);
        children.forEach((child) =>
          child.events.forEach((id) => eventIds.add(id)),
        );
      }

      if (self) {
        const events = await this.userService.getEventsFor(id);
        events.forEach((id) => eventIds.add(id));
      }

      return await this.eventService.getMany(Array.from(eventIds));
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
      const user = await this.userService.get(userIds[i]);
      //make the data safe. probably could do this in a pipe?
      const userInfo = new UserInfoDto(user);
      users.push(userInfo);
    }

    return users;
  }
}
