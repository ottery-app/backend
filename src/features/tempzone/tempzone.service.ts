import { Injectable } from '@nestjs/common';
import { ChildRequestDto, classifyWithDto, id, noId, requestStatus, requestType } from '@ottery/ottery-dto';
import * as delay from 'delay';
import { timeout, tryagain } from './tempzone.meta';
import { ChildService } from '../child/child.service';
import { LocatableService } from '../locatable/locatable.service';
import { ChildReqeust, ChildReqeustDocument } from './childRequest.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

function requestPipe(request, responce) {
    if (responce) {
        return responce;
    } else {
        const res = {
            child: noId,
            event: noId,
            guardian: noId,
            status: requestStatus.NONE,
            type: requestType.NONE,
            ...request,
        }

        classifyWithDto(ChildRequestDto, res, {throw:true})
        return res;
    }
}

@Injectable()
export class TempZoneService {
    //child id timeout
    private delays = new Map<id, any>();
    
    constructor(
        private childService: ChildService,
        private locatableService: LocatableService,
        @InjectModel(ChildReqeust.name) private childRequestModel: Model<ChildReqeustDocument>,
    ) {}

    private async saveRequest(childRequest: ChildRequestDto) {
        let request = await this.getRequestByChildId(childRequest.child);

        if (request) {
            request = Object.assign(request, childRequest);
        } else {
            request = new this.childRequestModel(childRequest);
        }

        return await request.save();
    }

    private async deleteRequest(childRequest: ChildRequestDto) {
        const request = await this.getRequestByChildId(childRequest.child);

        if (request) {
            return await request.delete();
        }
    }

    private async getRequestByChildId(childId: id) {
        return await this.childRequestModel.findOne({child:childId});
    }

    private async getRequestsByEventId(eventId: id) {
        return await this.childRequestModel.find({event: eventId});
    }

    private async makeRequest(childRequest: ChildRequestDto, type:requestType) {
        let request = await this.getRequestByChildId(childRequest.child);

        if (request) {
            for (const key in childRequest) {
                request[key] = childRequest[key]; // This will output each key in the object
            }

            request.status = requestStatus.INPROGRESS;
            request.type = type;

            request = await request.save();
        } else {
            childRequest.status = requestStatus.INPROGRESS;
            childRequest.type = type;
            request = await this.saveRequest(childRequest);
        }

        (async ()=>{
            let waittime = 0;
            do {
                await delay(tryagain);
                waittime += tryagain;

                request = await this.getRequestByChildId(request.child) || request;

                if (waittime >= timeout) {
                    request = await this.declineRequest(request);
                }
            } while (request && request.status === requestStatus.INPROGRESS);
        })()

        return request;
    }

    async pickupRequest(dropOffRequest: ChildRequestDto) {
        return await this.makeRequest(dropOffRequest, requestType.PICKUP);
    }

    async dropOffRequest(dropOffRequest: ChildRequestDto) {
        return await this.makeRequest(dropOffRequest, requestType.DROPOFF);
    }

    async checkChildStatus(childId: id) {
        let res = await this.getRequestByChildId(childId);
        return requestPipe({child:childId}, res);
    }

    async checkEventStatus(eventId: id) {
        let res = await this.getRequestsByEventId(eventId);
        return res.map((res)=>requestPipe({event:eventId}, res));
    }

    async acceptRequest(childRequest: ChildRequestDto, acceptor: id) {
        //update local
        let request = await this.getRequestByChildId(childRequest.child);
        request.status = requestStatus.ACCEPTED;
        request = await request.save();

        //stamp da homie
        const child = await this.childService.findOneById(childRequest.child);

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
        let request = await this.getRequestByChildId(childRequest.child);

        if (request) {
            request.status = requestStatus.REJECTED;
            await request.save();
            return request;
        } else { // this path is broken
            request = await this.makeRequest(childRequest, childRequest.type);
            return await this.declineRequest(request);
        }
    }
}