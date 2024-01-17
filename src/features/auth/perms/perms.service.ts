import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { id, perm } from '@ottery/ottery-dto';
import { Perms, PermsDocument } from './perms.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PermsService {
    constructor(
        @InjectModel(Perms.name) private permissionModel: Model<PermsDocument>,
    ){}

    async addPerms(owner: id, ownee:id, ...perms:perm[]) {
        let permDoc = await this.permissionModel.findOne({
            owner,
            ownee,
        });

        if (!permDoc) {
            permDoc = await new this.permissionModel({owner, ownee, perms:[]})
        }

        for (let i = 0; i < perms.length; i++) {
            if (!permDoc.perms.includes(perms[i])) {
                permDoc.perms = [...permDoc.perms, perms[i]]
            }
        }

        return await permDoc.save();
    }

    async validateAction(owner:id, ownee:id, ...required:perm[]) {
        const permDoc = await this.permissionModel.findOne({
            owner,
            ownee,
        });

        return permDoc.perms.includes(perm.SUPER) || required
            .map((perm)=>permDoc.perms.includes(perm))
            .every((result=>result === true));
    }

    async requireValidAction(owner:id, ownee:id, ...required:perm[]) {
        if (!this.validateAction(owner, ownee, ...required)) {
            throw new HttpException("User lacks permissions", HttpStatus.FORBIDDEN);
        }
    }
}