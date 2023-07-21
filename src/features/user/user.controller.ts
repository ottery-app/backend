import { Body, Controller, Get, HttpException, HttpStatus, Param, ParseBoolPipe, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ChildService } from '../child/child.service';
import { UserInfoDto } from "ottery-dto";
import { id } from 'ottery-dto';
import { EventService } from '../event/event.service';

@Controller('api/user')
export class UserController {
    constructor(
        private childService: ChildService,
        private userService: UserService,
        private eventService: EventService,
    ) {}

    @Get(':userId/children')
    async getChildren (
        @Param('userId') userId: id,
        @Query('at') at?: string, //id
        @Query('notat') notAt?: string //id
    ) {
        try {
            const user = await this.userService.findOneById(userId);
            let children = await this.childService.findManyByIds(user.children);
            
            if (at) {
                children = children.filter((child)=>child.lastStampedLocation.at === at);
            }

            if (notAt) {
                children = children.filter(child=>child.lastStampedLocation.at !== notAt);
            }

            return children;
        } catch (e) {
            throw new HttpException("Failed to get children", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(":userId/events")
    async getEventsFor(
        @Param('userId') id: id,
        @Query('children', ParseBoolPipe) children: boolean = false,
        @Query('self', ParseBoolPipe) self: boolean = false,
    ) { 
        try {
            const eventIds = new Set<id>();

            if (children) {
                const childIds = await this.userService.getChildrenFor(id);
                const children = await this.childService.findManyByIds(childIds);
                children.forEach(child=>child.events.forEach(id=>eventIds.add(id)));
            }

            if (self) {
                const events = await this.userService.getEventsFor(id);
                events.forEach(id=>eventIds.add(id));
            }

            return await this.eventService.findManyByIds(Array.from(eventIds));
        } catch (e) {
            throw e;
        }

    }

    @Get('info')
    async getInfo (
        @Query("users") userIds: id[]
    ) {
        const users = [];

        for (let i = 0; i < userIds.length; i++) {
            const user = await this.userService.findOneById(userIds[i]);
            //make the data safe. probably could do this in a pipe?
            const userInfo = new UserInfoDto(user);
            users.push(userInfo);
        }

        return users;
    }
}