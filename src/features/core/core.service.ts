import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UserService } from './user/user.service';
import { EventService } from './event/event.service';
import { ChildService } from './child/child.service';

@Injectable()
export class CoreService implements OnApplicationBootstrap {
    user: UserService;
    event: EventService;
    child: ChildService;

    constructor(
        private userService: UserService,
        private eventService: EventService,
        private childService: ChildService,
    ) {}

    onApplicationBootstrap() {
        this.user = this.userService;
        this.event = this.eventService;
        this.child = this.childService;
    }
}