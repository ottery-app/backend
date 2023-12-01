import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseBoolPipe,
  Post,
  Query,
  Patch
} from '@nestjs/common';
import { UserService } from './user.service';
import { ChildService } from '../child/child.service';
import { DataFieldDto, IdArrayDto, ImageDto, UserInfoDto } from '@ottery/ottery-dto';
import { id } from '@ottery/ottery-dto';
import { EventService } from '../event/event.service';
import { Sesh } from '../../auth/sesh/Sesh.decorator';
import { ImageFileService } from 'src/features/images/imageFile.service';
import { DataController } from 'src/features/data/data.controller';
import { DataService } from 'src/features/data/data.service';

@Controller('api/user')
export class UserController implements DataController {
  constructor(
    private childService: ChildService,
    private userService: UserService,
    private eventService: EventService,
    private imageService: ImageFileService,
    private dataService: DataService,
  ) {}

  @Get(":userId/data")
  async getData(
    @Param('userId') userId: id,
  ) {
    return (await this.userService.get(userId)).data;
  }

  @Get(":userId/data/missing")
  async getMissingData(
    @Param('userId') userId: id,
    @Query("desired") desired:id[],
  ) {
    const user  = await this.userService.get(userId);
    return await this.dataService.getMissingFields(user, desired);
  }

  @Patch(":userId/data")
  async updateData(
    @Param('userId') userId: id,
    @Body() data: DataFieldDto[]
  ) {
    const user = await this.userService.get(userId);
    user.data = await this.dataService.update(user, data);
    await this.userService.update(userId, user);
  }

  @Post(":userId/pfp")
  async updateProfileImage(
    //@Sesh() sesh,
    @Param('userId') userId: id,
    @Body() pfp: ImageDto,
  ) {
    const user = await this.userService.get(userId);
    await this.imageService.deletePublicFile(user.pfp.src);
    user.pfp = {
      aspectRatio: pfp.aspectRatio,
      src: (await this.imageService.uploadPublicFile(pfp.src)).url,
    };
    await this.userService.update(userId, user);
  }

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

      if (hasEvent !== undefined) {
        if (Boolean(hasEvent) === false) {
          children = children.filter((child) => child.events.length === 0);
        }
  
        if (Boolean(hasEvent) === true) {
          children = children.filter((child) => child.events.length !== 0);
        }
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
