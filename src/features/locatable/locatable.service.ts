import { Injectable } from '@nestjs/common';
import { id } from '@ottery/ottery-dto';
import { LocateAble } from './locatable.interface';

@Injectable()
export class LocatableService {
    constructor(){}

    public stamp(object: LocateAble, at: id, withh: id) {
        object.lastStampedLocation = {
            at: at,
            with: withh,
            time: new Date().getTime(),
        }
    }   
}