import { Controller, Param, HttpException, HttpStatus, Patch } from '@nestjs/common';
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
        throw new HttpException("error", HttpStatus.BAD_REQUEST);
    }

    event.volenteers.push(user._id);
    user.events.push(event._id);
    //TODO apply volenteer permissions?
    await this.coreService.event.update(event._id, event);
    await this.coreService.user.update(user._id, user);
  }
}