import { Controller, Body, Patch, Param, HttpException, HttpStatus } from '@nestjs/common';
import { IdArrayDto, id, noId } from '@ottery/ottery-dto';
import { Sesh } from '../auth/sesh/Sesh.decorator';
import { LocatableService } from '../locatable/locatable.service';
import { RosterService } from './roster.service';
import { CoreService } from '../core/core.service';

@Controller('api/roster')
export class RosterController {
  constructor(
    private locatableService: LocatableService,
    private rosterService: RosterService,
    private coreService: CoreService,
  ) {}

  @Patch(":eventId/dropOff")
  async dropOff(
    @Sesh() sesh,
    @Param("eventId") eventId: id,
    @Body() childIds: IdArrayDto
  ) {
    if (sesh.event !== eventId) {
      throw new HttpException(
        "Not allowed to mark children as present",
        HttpStatus.BAD_REQUEST,
      )
    }

    // const event = await this.coreService.event.get(eventId);

    // const children = await this.coreService.child.getMany(childIds.ids);


    console.log(sesh);
    console.log(eventId);
    console.log(childIds);
  }
}
