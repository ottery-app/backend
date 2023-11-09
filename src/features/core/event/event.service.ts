import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './event.schema';
import { CreateEventDto, id} from '@ottery/ottery-dto';
import { CrudService } from 'src/features/interfaces/crud.service.inerface';
import { CreateEvent } from './CreateEvent';

@Injectable()
export class EventService implements CrudService {
    constructor(
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    ){}

    async create(eventDto: CreateEvent) {
        const event = new this.eventModel({
            ...eventDto,
            attendees: [],
            volenteers: [],
            managers: [eventDto.leadManager],
        });

        // const permDoc = await this.permService.create(owner, {id: event._id, ref: Event.name}, perm.SUPER);
        // event.perms.push(makePermLinkDto({owner, perms: permDoc._id}));

        return event.save();
    }

     async update(eventId: id, event: Event) {
        // overwrite is false so only modified fields are updated
        return await this.eventModel.findByIdAndUpdate(eventId, event).setOptions({overwrite: false, new: true});
    }

    async get(id: id) {
        return await this.eventModel.findById(id);
    }

    async getMany(ids: id[]) {
        return await this.eventModel.find({'_id': { $in: ids }});
    }

    async delete(id: id) {
        throw new Error("delete not yet implemented");
    }

    // async signUpVolenteers(eventId:id, ids:id[]) {
    //     const event = await this.findOneById(eventId);
        
    //     //const users = await this.userService.findManyById(ids);
    //     // for (let i = 0; i < users.length; i++) {
    //     //     if (!users[i].events.includes(eventId)) {
    //     //         users[i].events.push(eventId);
    //     //         users[i].save();
    //     //     }
    //     // }

    //     return await this.signUpX(event, "volenteers", ids, event.volenteerSignUp);
    // }

    // async signUpAttendees(eventId:id, ids:id[]) {
    //     const event = await this.findOneById(eventId);

    //     const children = await this.childService.findManyByIds(ids);
    //     for (let i = 0; i < children.length; i++) {
    //         if (!children[i].events.includes(eventId)) {
    //             children[i].events.push(eventId);
    //             children[i].save();
    //         }
    //     }

    //     return await this.signUpX(event, "attendees", ids, event.attendeeSignUp);
    // }

    // private async signUpX(event: EventDocument, addTo:string, ids: id[], requiredFields: id[]) {
    //     const missing = {};
    //     for (let i = 0 ; i < ids.length; i++) {
    //         missing[ids[i]] = await this.dataService.findMissingDataForOwner(ids[i], requiredFields);

    //         if (!missing[ids[i]].length) {
    //             if (!event[addTo].includes(ids[i])) {
    //                 event[addTo].push(ids[i]);
    //             }
    //         }
    //     }

    //     event.save();
    //     return missing;
    // }
}