import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './event.schema';
import { id } from '@ottery/ottery-dto';
import { CrudService } from 'src/features/interfaces/crud.service.inerface';
import { CreateEvent } from './CreateEvent';

@Injectable()
export class EventService implements CrudService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(eventDto: CreateEvent) {
    const event = new this.eventModel({
      ...eventDto,
      attendees: [],
      volenteers: [eventDto.leadManager],
      managers: [eventDto.leadManager],
    });

    // const permDoc = await this.permService.create(owner, {id: event._id, ref: Event.name}, perm.SUPER);
    // event.perms.push(makePermLinkDto({owner, perms: permDoc._id}));

    return event.save();
  }

  async update(eventId: id, event: Event) {
    // overwrite is false so only modified fields are updated
    // return await this.eventModel
    //   .findByIdAndUpdate(eventId, event)
    //   .setOptions({ overwrite: false, new: true });

    const eventDoc = await this.eventModel.findById(eventId);
    Object.keys(event).forEach((key) => (eventDoc[key] = event[key]));
    eventDoc.save();
    return eventDoc;
  }

  async get(id: id) {
    return await this.eventModel.findById(id);
  }

  async getMany(ids: id[]) {
    return await this.eventModel.find({ _id: { $in: ids } });
  }

  async delete(id: id) {
    throw new Error('delete not yet implemented');
  }
}
