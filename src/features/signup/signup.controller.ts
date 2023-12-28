import { Controller, Param, HttpException, HttpStatus, Patch, Query } from '@nestjs/common';
import { id } from '@ottery/ottery-dto';
import { SeshDocument } from '../auth/sesh/sesh.schema';
import { Sesh } from '../auth/sesh/Sesh.decorator';
import { CoreService } from '../core/core.service';
import { DataService } from '../data/data.service';

@Controller('api/signup/')
export class SignupController {
  constructor(
    private coreService: CoreService,
    private dataService: DataService,
  ) {}

  @Patch('volenteer/:eventId')
  async Volenteer(
    @Sesh() sesh: SeshDocument,
    @Param('eventId') eventId: id,
    //@Body() userIdDto: IdDto,
  ) {
    const user = await this.coreService.user.get(sesh.userId);
    const event = await this.coreService.event.get(eventId);
    const missing = await this.dataService.getMissingFields(user, event.volenteerSignUp);

    if (missing.length) {
      throw new HttpException("Missing user data", HttpStatus.BAD_REQUEST);
    }

    if (!event.volenteers.includes(user._id)) {
      event.volenteers.push(user._id);
      await this.coreService.event.update(event._id, event);
    }

    if (!user.events.includes(event._id)) {
      user.events.push(event._id);
      await this.coreService.user.update(user._id, user);
    }
  }

  @Patch('attendee/:eventId')
  async Attendee(
    @Sesh() sesh: SeshDocument,
    @Param('eventId') eventId: id,
    @Query('childId') childId: id,
  ) {
    const child = await this.coreService.child.get(childId);
    const event = await this.coreService.event.get(eventId);
    let missing = await this.dataService.getMissingFields(child, event.attendeeSignUp);

    if (missing.length) {
      throw new HttpException("Missing child data", HttpStatus.BAD_REQUEST);
    }

    //TODO consider checking all guardians???
    const user = await this.coreService.user.get(sesh.userId);
    missing = await this.dataService.getMissingFields(user, event.guardianSignUp);

    if (missing.length) {
      throw new HttpException("Missing guardian data", HttpStatus.BAD_REQUEST);
    }

    if (!event.attendees.includes(child._id)) {
      event.attendees.push(childId);
      await this.coreService.event.update(event._id, event);
    }

    if (!child.events.includes(event._id)) {
      child.events.push(eventId);
      await this.coreService.child.update(child._id, child);
    }
  }
}