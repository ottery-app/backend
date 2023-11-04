import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { id, UserInfoDto } from '@ottery/ottery-dto';
import { Query } from '@nestjs/common/decorators';
import { compareIds } from 'src/functions/compareIds';
import { Sesh } from '../../auth/sesh/Sesh.decorator';
import { SeshDocument } from '../../auth/sesh/sesh.schema';
import { CoreService } from '../core.service';

@Controller('api/event')
export class EventController {
    constructor(
        private coreService: CoreService,
    ) {}

    // @Post()
    // async create (
    //     @Sesh() sesh: SeshDocument,
    //     @Body() createEventDto: CreateEventDto,
    // ){
    //     try {
    //         const userID = sesh.userId;

    //         const volIds = await this.formFieldService.createMany(createEventDto.volenteerSignUp);
    //         const atenIds = await this.formFieldService.createMany(createEventDto.attendeeSignUp);
            
    //         const event = await this.coreService.event.create({
    //             id: userID,
    //             ref: User.name,
    //         },{
    //             ...createEventDto,
    //             attendeeSignUp: atenIds,
    //             volenteerSignUp: volIds,
    //         });

    //         await this.coreService.user.addEventById(userID, event._id);

    //         return event;
    //     } catch (e) {
    //         throw e;
    //     }
    // }

    @Get(":id")
    async get(
        @Param('id') id: id,
    ) {
        try {
            return await this.coreService.event.findOneById(id);
        } catch (e) {
            throw e;
        }
    }

    @Get()
    async getEvents(
        @Param("id") id:id,
        @Query("ids") eventIds: id[],
    ) {
        try {
            return await this.coreService.event.findManyByIds(eventIds);
        } catch (e) {
            throw e;
        }
    }

    @Get(":id/signup/volenteer")
    async getVolenteerSignup(
        @Param("id") id: id,
    ) {
        try {
            const event = await this.coreService.event.findOneById(id);
            return event.volenteerSignUp;
        } catch (e) {
            throw e;
        }
    }

    @Get(":id/is/volenteer")
    async getVolenteerStatus(
        @Sesh() sesh: SeshDocument,
        @Param("id") id: id,
        //can later add user id. But should first check the sesh status as plain id may be insecure.
    ) {
        try {
            const userId = sesh.userId;
            const volenteers = await (await this.coreService.event.findOneById(id)).volenteers;
            for (let i = 0; i < volenteers.length; i++) {
                if (compareIds(volenteers[i], userId)) {
                    return true;
                }
            }
            return false;
        } catch (e) {
            throw e;
        }
    }

    @Get(":id/signup/attendee")
    async getAttendeeSignup(
        @Param("id") id: id,
    ) {
        try {
            const event = await this.coreService.event.findOneById(id);
            return event.attendeeSignUp;
        } catch (e) {
            throw e;
        }
    }

    @Get(":id/owner") 
    async getOwner(
        @Param("id") id: id,
    ){
        try {
            const event = await this.coreService.event.findOneById(id);
            //TODO this is not guarenteed to always be the case that the first element is always the owner.
            //this issue should be switched to be more clearly expressed in the data. The information
            //of who is in charge is held in the source code right here which is bad practice because as the code
            //grows it will be harder to find this info. As a result it should be saved elsewhere.
            const ownerId = event.perms[0].owner.id;
            const owner = await this.coreService.user.findOneById(ownerId);
            return new UserInfoDto(owner);
        } catch (e) {
            throw e;
        }
    }

    // @Patch(":id/signup/volenteer")
    // async signupVolenteers(
    //     @Param("id") id: id,
    //     @Body() ids: id[],
    // ) {
    //     try {
    //         return await this.eventService.signUpVolenteers(id, ids);
    //     } catch (e) {
    //         throw e;
    //     }
    // }

    // @Patch(":id/signup/attendee")
    // async signupAttendees(
    //     @Param("id") id: id,
    //     @Body() ids: id[],
    // ) {
    //     try {
    //         return await this.eventService.signUpAttendees(id, ids);
    //     } catch (e) {
    //         throw e;
    //     }
    // }
}