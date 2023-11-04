import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './event.schema';
import { EventDto, id, makePermLinkDto, MultiSchemeDto, perm } from '@ottery/ottery-dto';
import { DataService } from '../../data.make_interface/data.service';
import { PermsService } from '../../auth/perms.make_interface/perms.service';
import { ChildService } from '../child/child.service';
import { UserService } from '../user/user.service';

@Injectable()
export class EventService {
    constructor(
        private dataService: DataService,
        private permService: PermsService,
        private childService: ChildService,
        private userService: UserService,
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    ){}

    async create(owner: MultiSchemeDto, eventDto: EventDto) {
        const event = new this.eventModel(eventDto);
        event.attendees = [];
        event.volenteers = [];

        const permDoc = await this.permService.create(owner, {id: event._id, ref: Event.name}, perm.SUPER);
        event.perms.push(makePermLinkDto({owner, perms: permDoc._id}));

        return event.save();
    }

     async update(event: Event) {
        // overwrite is false so only modified fields are updated
        const updated = await this.eventModel.findByIdAndUpdate(event._id, event).setOptions({overwrite: false, new: true});
        
        if (!updated) {
            throw new NotFoundException();
        } else {
            return updated;
        }
    }

    async findOneById(id: id) {
        const found = await this.eventModel.findById(id);

        if (!found) {
            throw new NotFoundException();
        } else {
            return found;
        }
    }

    async findManyByIds(ids: id[]) {
        return await this.eventModel.find({'_id': { $in: ids }});
    }

    async signUpVolenteers(eventId:id, ids:id[]) {
        const event = await this.findOneById(eventId);
        
        const users = await this.userService.findManyById(ids);
        for (let i = 0; i < users.length; i++) {
            if (!users[i].events.includes(eventId)) {
                users[i].events.push(eventId);
                users[i].save();
            }
        }

        return await this.signUpX(event, "volenteers", ids, event.volenteerSignUp);
    }

    async signUpAttendees(eventId:id, ids:id[]) {
        const event = await this.findOneById(eventId);

        const children = await this.childService.findManyByIds(ids);
        for (let i = 0; i < children.length; i++) {
            if (!children[i].events.includes(eventId)) {
                children[i].events.push(eventId);
                children[i].save();
            }
        }

        return await this.signUpX(event, "attendees", ids, event.attendeeSignUp);
    }

    private async signUpX(event: EventDocument, addTo:string, ids: id[], requiredFields: id[]) {
        const missing = {};
        for (let i = 0 ; i < ids.length; i++) {
            missing[ids[i]] = await this.dataService.findMissingDataForOwner(ids[i], requiredFields);

            if (!missing[ids[i]].length) {
                if (!event[addTo].includes(ids[i])) {
                    event[addTo].push(ids[i]);
                }
            }
        }

        event.save();
        return missing;
    }
}