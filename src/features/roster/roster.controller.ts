import { Controller, Body, Patch, Get, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { IdArrayDto, id, noId, requestStatus, requestType } from '@ottery/ottery-dto';
import { Sesh } from '../auth/sesh/Sesh.decorator';
import { CoreService } from '../core/core.service';
import { normalizeId } from 'src/functions/normalizeId';
import { TransferService } from './transfer/transfer.service';
import { TempZoneService } from './tempzone/tempzone.service';

@Controller('api/roster')
export class RosterController {
  constructor(
    private transferService: TransferService,
    private coreService: CoreService,
    private tempzoneService: TempZoneService,
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

    const requests = (await this.tempzoneService.checkEventStatus(eventId)).filter(request=>{
      return childIds.ids.includes(request.child) && request.type === requestType.DROPOFF && request.status === requestStatus.INPROGRESS; 
    });
    const requestMap = requests.reduce((map, request)=>{
      map[request.child] = request;
      return map;
    }, {})

    return await Promise.all(children.map(async (child)=>{
      await this.transferService.dropoffActions(child, event._id, noId);

      if (requestMap[child._id]) {
        this.tempzoneService.acceptRequest(requestMap[child._id], sesh.userId);
      }

      const childRes = await child.save();
      return childRes;
    }));
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
    const children = await this.coreService.child.getMany(childIds.ids);

    const requests = (await this.tempzoneService.checkEventStatus(eventId)).filter(request=>{
      return childIds.ids.includes(request.child) && request.type === requestType.PICKUP && request.status === requestStatus.INPROGRESS; 
    });
    const requestMap = requests.reduce((map, request)=>{
      map[request.child] = request;
      return map;
    }, {});

    return await Promise.all(children.map(async (child)=>{
      await this.transferService.pickupActions(child, noId);

      if (requestMap[child._id]) {
        this.tempzoneService.acceptRequest(requestMap[child._id], sesh.userId);
      }

      return await child.save();
    }));
  }
}
