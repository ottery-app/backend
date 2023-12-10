import { Controller, Body, Patch, Get, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { IdArrayDto, id, noId, tempzone } from '@ottery/ottery-dto';
import { Sesh } from '../auth/sesh/Sesh.decorator';
import { LocatableService } from '../locatable/locatable.service';
import { CoreService } from '../core/core.service';
import { normalizeId } from 'src/functions/normalizeId';

@Controller('api/roster')
export class RosterController {
  constructor(
    private locatableService: LocatableService,
    private coreService: CoreService,
  ) {}

  @Get(":eventId/attendees")
  async getAttendees(
    @Param("eventId") eventId: id,
    @Query("present") present: boolean | undefined,
  ) {
    present = present === 'true' as unknown as boolean
    const event = await this.coreService.event.get(eventId);
    const attendees = (await this.coreService.child.getMany(event.attendees)).filter((child)=>{
      if (present === true) {
        if (child.lastStampedLocation?.at) {
          return normalizeId(child.lastStampedLocation.at).equals(normalizeId(event._id));
        } else {
          return false;
        }
      } else if (present === false) {
        if (child.lastStampedLocation?.at) {
          return !normalizeId(child.lastStampedLocation.at).equals(normalizeId(event._id));
        } else {
          return true;
        }
      }

      return true;
    });

    return attendees;
  }

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

    const event = await this.coreService.event.get(eventId);
    const children = await this.coreService.child.getMany(childIds.ids);

    //if (event.tempzone === tempzone.Default) {
      return await Promise.all(children.map(async (child)=>{
        this.locatableService.stamp(child, event._id, noId);
        return await child.save();
      }));
    //}
  }

  @Patch(":eventId/pickup")
  async pickup(
    @Sesh() sesh,
    @Param("eventId") eventId: id,
    @Body() childIds: IdArrayDto
  ) {
    if (sesh.event !== eventId) {
      throw new HttpException(
        "Not allowed to dismiss children",
        HttpStatus.BAD_REQUEST,
      )
    }

    const event = await this.coreService.event.get(eventId);
    const children = await this.coreService.child.getMany(childIds.ids);

    //if (event.tempzone === tempzone.Default) {
      return await Promise.all(children.map(async (child)=>{
        this.locatableService.stamp(child, noId, noId);
        console.log(child)
        return await child.save();
      }));
    //}
  }
}
