import { Controller, Post, Body, Headers, Get, Param } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SeshService } from "../sesh/sesh.service";
import { EventService } from "./event.service";
import { perm, id, UserInfoDto } from 'ottery-dto';
import { CreateEventDto } from 'ottery-dto';
import { FormFieldService } from '../form/formField.service';
import { Patch, Query } from '@nestjs/common/decorators';
import { User } from '../user/user.schema';
import { compareIds } from 'src/functions/compareIds';
import { Sesh } from '../sesh/Sesh.decorator';
import { SeshDocument } from '../sesh/sesh.schema';

@Controller('api/event')
export class EventController {
    constructor(
        private userService: UserService,
        private eventService: EventService,
        private formFieldService: FormFieldService,
    ) {}

    @Post()
    async create (
        @Sesh() sesh: SeshDocument,
        @Body() createEventDto: CreateEventDto,
    ){
        try {
            const userID = sesh.userId;

            const volIds = await this.formFieldService.createMany(createEventDto.volenteerSignUp);
            const atenIds = await this.formFieldService.createMany(createEventDto.attendeeSignUp);
            
            const event = await this.eventService.create({
                id: userID,
                ref: User.name,
            },{
                ...createEventDto,
                attendeeSignUp: atenIds,
                volenteerSignUp: volIds,
            });

            await this.userService.addEventById(userID, event._id);

            return event;
        } catch (e) {
            throw e;
        }
    }

    @Get(":id")
    async get(
        @Param('id') id: id,
    ) {
        try {
            return await this.eventService.findOneById(id);
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
            return await this.eventService.findManyByIds(eventIds);
        } catch (e) {
            throw e;
        }
    }

    @Get(":id/signup/volenteer")
    async getVolenteerSignup(
        @Param("id") id: id,
    ) {
        try {
            const event = await this.eventService.findOneById(id);
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
            const volenteers = await (await this.eventService.findOneById(id)).volenteers;
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
            const event = await this.eventService.findOneById(id);
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
            const event = await this.eventService.findOneById(id);
            //TODO this is not guarenteed to always be the case that the first element is always the owner.
            //this issue should be switched to be more clearly expressed in the data. The information
            //of who is in charge is held in the source code right here which is bad practice because as the code
            //grows it will be harder to find this info. As a result it should be saved elsewhere.
            const ownerId = event.perms[0].owner.id;
            const owner = await this.userService.findOneById(ownerId);
            return new UserInfoDto(owner);
        } catch (e) {
            throw e;
        }
    }

    @Patch(":id/signup/volenteer")
    async signupVolenteers(
        @Param("id") id: id,
        @Body() ids: id[],
    ) {
        try {
            return await this.eventService.signUpVolenteers(id, ids);
        } catch (e) {
            throw e;
        }
    }

    @Patch(":id/signup/attendee")
    async signupAttendees(
        @Param("id") id: id,
        @Body() ids: id[],
    ) {
        try {
            return await this.eventService.signUpAttendees(id, ids);
        } catch (e) {
            throw e;
        }
    }
}