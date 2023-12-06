import { Injectable } from '@nestjs/common';
import {
  ChildRequestDto,
  classifyWithDto,
  id,
  noId,
  requestStatus,
  requestType,
} from '@ottery/ottery-dto';
import * as delay from 'delay';
import { timeout, tryagain } from './tempzone.meta';
import { LocatableService } from '../../locatable/locatable.service';
import { ChildReqeust, ChildReqeustDocument } from './childRequest.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CoreService } from 'src/features/core/core.service';

//used to always return something
function requestPipe(request, responce):ChildReqeustDocument {
  if (responce) {
    return responce;
  } else {
    const res:ChildRequestDto = {
      _id: request.child,
      child: noId,
      event: noId,
      guardian: noId,
      status: requestStatus.NONE,
      type: requestType.NONE,
      ...request,
    }

    classifyWithDto(ChildRequestDto, res, { throw: true });
    return res as ChildReqeustDocument;
  }
}

@Injectable()
export class TempZoneService {
  //child id timeout
  private delays = new Map<id, any>();

  constructor(
    private coreService: CoreService,
    private locatableService: LocatableService,
    @InjectModel(ChildReqeust.name)
    private childRequestModel: Model<ChildReqeustDocument>,
  ) {}


  private async saveRequest(childRequest: ChildRequestDto) {
    let request = await this.childRequestModel.findOne({ child: childRequest.child });

    if (request) {
      request = Object.assign(request, childRequest);
    } else {
      request = new this.childRequestModel(childRequest);
    }

    return await request.save();
  }

  async makeRequest(childRequest: ChildRequestDto) {
    let request = await this.childRequestModel.findOne({ child: childRequest.child });

    if (request) {
      for (const key in childRequest) {
        request[key] = childRequest[key]; // This will output each key in the object
      }

      request.status = requestStatus.INPROGRESS;

      request = await request.save();
    } else {
      childRequest.status = requestStatus.INPROGRESS;
      request = await this.saveRequest(childRequest);
    }

    (async () => {
      let waittime = 0;
      do {
        await delay(tryagain);
        waittime += tryagain;

        request = (await this.childRequestModel.findOne({ child: childRequest.child })) || request;

        if (waittime >= timeout) {
          request = await this.declineRequest(request);
        }
      } while (request && request.status === requestStatus.INPROGRESS);
    })();

    return request;
  }

  async checkChildStatus(childId: id) {
    const res = await this.childRequestModel.findOne({ child: childId });
    return requestPipe({ child: childId }, res);
  }

  async checkEventStatus(eventId: id) {
    const res = await this.childRequestModel.find({ event: eventId });;
    return res.map((res) => requestPipe({ event: eventId }, res));
  }

  async checkUserStatus(guardianId: id) {
    const res = await this.childRequestModel.find({guardian: guardianId})
    return res.map((res) => requestPipe({guardian: guardianId}, res));
  }

  async acceptRequest(childRequest: ChildRequestDto, acceptor: id) {
    //update local
    let request = await this.childRequestModel.findOne({ child: childRequest.child });
    request.status = requestStatus.ACCEPTED;
    request = await request.save();

    //stamp da homie
    const child = await this.coreService.child.get(childRequest.child);

    if (childRequest.type === requestType.PICKUP) {
      this.locatableService.stamp(child, noId, acceptor);
    } else {
      this.locatableService.stamp(child, childRequest.event, acceptor);
    }

    await child.save();

    //return updates
    return request;
  }

  async declineRequest(childRequest: ChildRequestDto) {
    let request = await this.childRequestModel.findOne({ child: childRequest.child });

    if (request) {
      request.status = requestStatus.REJECTED;
      await request.save();
      return request;
    } else {
      // this path is broken
      request = await this.makeRequest(childRequest);
      return await this.declineRequest(request);
    }
  }
}
