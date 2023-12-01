import { Controller, Get, Param } from '@nestjs/common';
import { CreateEventDto, EmailDto, id, role, UserInfoDto } from '@ottery/ottery-dto';
import { Body, Post, Query } from '@nestjs/common/decorators';
import { compareIds } from 'src/functions/compareIds';
import { SeshDocument } from 'src/features/auth/sesh/sesh.schema';
import { Sesh } from 'src/features/auth/sesh/Sesh.decorator';
import { CoreService } from '../core.service';
import { Roles } from 'src/features/auth/roles/roles.decorator';
import { DeeplinkService } from 'src/features/deeplink/deeplink.service';
import { TokenService } from 'src/features/token/token.service';
import { TokenType } from 'src/features/token/token.schema';
import { AlertService } from 'src/features/alert/alert.service';

@Controller('api/event')
export class EventController {
    constructor(
        private coreService: CoreService,
        private alertService: AlertService, 
        private deeplinkService: DeeplinkService,
        private tokenService: TokenService,
    ) {}

    @Post()
    async create (
        @Sesh() sesh: SeshDocument,
        @Body() createEventDto: CreateEventDto,
    ){
        try {
            const userID = sesh.userId;

            // const volIds = await this.formFieldService.createMany(createEventDto.volenteerSignUp);
            // const atenIds = await this.formFieldService.createMany(createEventDto.attendeeSignUp);

            const event = await this.coreService.event.create({
            ...createEventDto,
            leadManager: userID,
            });

            await this.coreService.user.addEvent(userID, event._id);

            return event;
        } catch (e) {
            throw e;
        }
  }

  @Get(':id')
  async get(@Param('id') id: id) {
    try {
      return await this.coreService.event.get(id);
    } catch (e) {
      throw e;
    }
  }

  @Get()
  async getEvents(@Param('id') id: id, @Query('ids') eventIds: id[]) {
    try {
      return await this.coreService.event.getMany(eventIds);
    } catch (e) {
      throw e;
    }
  }

  // @Get(":id/signup/volenteer")
  // async getVolenteerSignup(
  //     @Param("id") id: id,
  // ) {
  //     try {
  //         const event = await this.coreService.event.findOneById(id);
  //         return event.volenteerSignUp;
  //     } catch (e) {
  //         throw e;
  //     }
  // }

  @Get(':id/is/volenteer')
  async getVolenteerStatus(
    @Sesh() sesh: SeshDocument,
    @Param('id') id: id,
    //can later add user id. But should first check the sesh status as plain id may be insecure.
  ) {
    try {
      const userId = sesh.userId;
      const volenteers = (await this.coreService.event.get(id)).volenteers;
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

  @Get(':id/owner')
  async getOwner(
    @Param('id') id: id
  ) {
    try {
      const event = await this.coreService.event.get(id);
      //TODO this is not guarenteed to always be the case that the first element is always the owner.
      //this issue should be switched to be more clearly expressed in the data. The information
      //of who is in charge is held in the source code right here which is bad practice because as the code
      //grows it will be harder to find this info. As a result it should be saved elsewhere.
      const owner = await this.coreService.user.get(
        event.leadManager || event.managers[0],
      );
      return new UserInfoDto(owner);
    } catch (e) {
      throw e;
    }
  }
}
