import { Controller, Get, Post, Body } from '@nestjs/common';
import {
  ChildRequestDto,
  id,
  requestStatus,
  requestType,
} from '@ottery/ottery-dto';
import { TempZoneService } from './tempzone.service';
import { Patch, Query } from '@nestjs/common/decorators';
import { ArrayValidationPipe } from 'src/pipes/ArrayValidationPipe';
import { SeshDocument } from '../../auth/sesh/sesh.schema';
import { Sesh } from '../../auth/sesh/Sesh.decorator';

@Controller('api/tempzone')
export class TempZoneController {
  constructor(private tempzoneService: TempZoneService) {}

  @Post('request/dropoff')
  async requestChildDropOff(
    @Body(ArrayValidationPipe(ChildRequestDto)) requests: ChildRequestDto[],
  ) {
    const responces: ChildRequestDto[] = [];

    for (let i = 0; i < requests.length; i++) {
      responces.push(await this.tempzoneService.dropOffRequest(requests[i]));
    }

    return responces;
  }

  @Post('request/pickup')
  async requestChildPickUp(
    @Body(ArrayValidationPipe(ChildRequestDto)) requests: ChildRequestDto[],
  ) {
    const responces: ChildRequestDto[] = [];

    for (let i = 0; i < requests.length; i++) {
      responces.push(await this.tempzoneService.pickupRequest(requests[i]));
    }

    return responces;
  }

  @Patch('request/accept')
  async acceptRequest(
    @Sesh() sesh: SeshDocument,
    @Body(ArrayValidationPipe(ChildRequestDto)) requests: ChildRequestDto[],
  ) {
    const userId = sesh.userId;

    const responces: ChildRequestDto[] = [];

    for (let i = 0; i < requests.length; i++) {
      responces.push(
        await this.tempzoneService.acceptRequest(requests[i], userId),
      );
    }

    return responces;
  }

  @Patch('request/decline')
  async declineRequest(
    @Body(ArrayValidationPipe(ChildRequestDto)) requests: ChildRequestDto[],
  ) {
    const responces: ChildRequestDto[] = [];

    for (let i = 0; i < requests.length; i++) {
      responces.push(await this.tempzoneService.declineRequest(requests[i]));
    }

    return responces;
  }

  @Get('request/status')
  async checkInOnRequest(
    //this should be able to filter based on both but rn i see no point so im not
    @Query('children') children?: id[],
    @Query('event') event?: id,
    @Query('type') type?: requestType, // requestType
    @Query('status') status?: requestStatus, //
  ) {
    let requests = [];

    if (children) {
      const ids: id[] = children;
      for (let i = 0; i < ids.length; i++) {
        requests.push(await this.tempzoneService.checkChildStatus(ids[i]));
      }
    }

    if (event) {
      const id: id = event;
      requests = [
        ...requests,
        ...(await this.tempzoneService.checkEventStatus(id)),
      ];
    }

    if (requests && type) {
      requests = requests.filter((req) => req.type === type);
    }

    if (requests && status) {
      requests = requests.filter((req) => req.status === status);
    }

    return requests.filter((i) => i);
  }
}
