import { Controller, Get, Post, Body } from '@nestjs/common';
import {
  ChildRequestDto,
  id,
  isId,
  requestStatus,
  requestType,
} from '@ottery/ottery-dto';
import { TempZoneService } from './tempzone.service';
import { Patch, Query } from '@nestjs/common/decorators';
import { ArrayValidationPipe } from 'src/pipes/ArrayValidationPipe';
import { SeshDocument } from '../../auth/sesh/sesh.schema';
import { Sesh } from '../../auth/sesh/Sesh.decorator';
import { Prop } from '@nestjs/mongoose';

@Controller('api/tempzone')
export class TempZoneController {
  constructor(private tempzoneService: TempZoneService) {}

  @Post('request')
  async requestChildDropOff(
    @Body(ArrayValidationPipe(ChildRequestDto)) requests: ChildRequestDto[],
  ) {
    const responces: ChildRequestDto[] = [];

    for (let i = 0; i < requests.length; i++) {
      responces.push(await this.tempzoneService.makeRequest(requests[i]));
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
    @Sesh() sesh: SeshDocument,
    @Body(ArrayValidationPipe(ChildRequestDto)) requests: ChildRequestDto[],
  ) {
    const responces: ChildRequestDto[] = [];

    for (let i = 0; i < requests.length; i++) {
      responces.push(await this.tempzoneService.declineRequest(requests[i], sesh.userId));
    }

    return responces;
  }

  @Get('request/status')
  async checkInOnRequest(
    //this should be able to filter based on both but rn i see no point so im not
    @Query('children') children?: id[],
    @Query('event') event?: id,
    @Query('guardian') guardian?: id,
    @Query('type') type?: requestType, // requestType
    @Query('status') status?: requestStatus, //
  ) {
    let requests:any = {};

    if (children) {
      const ids: id[] = children;
      for (let i = 0; i < ids.length; i++) {
        const request = await this.tempzoneService.checkChildStatus(ids[i]);
        requests[request._id] = await this.tempzoneService.checkChildStatus(ids[i]);
      }
    }

    if (event) {
      const id: id = event;
      (await this.tempzoneService.checkEventStatus(id)).forEach((request)=>{
        requests[request._id] = request;
      })
    }

    if (guardian) {
      const id: id = guardian;
      (await this.tempzoneService.checkUserStatus(id)).forEach((request)=>{
        requests[request._id] = request;
      })
    }

    requests = Object.values(requests);

    if (requests && type) {
      requests = requests.filter((req) => req.type === type);
    }

    if (requests && status) {
      requests = requests.filter((req) => req.status === status);
    }

    requests = requests.filter((i) => i);
    return requests;
  }
}
