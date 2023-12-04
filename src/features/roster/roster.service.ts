import { Injectable } from '@nestjs/common';
import { id } from "@ottery/ottery-dto";
import { LocateAble } from '../locatable/locatable.interface';

@Injectable()
export class RosterService {
    constructor(){}

    dropOff(at:id, who:LocateAble, by:id){
        
    }
}