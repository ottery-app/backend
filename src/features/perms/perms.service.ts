import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Perms, PermsDocument } from './permission.schema';
import { MultiSchemeDto } from '@ottery/ottery-dto';
import { perm } from '@ottery/ottery-dto';
import { OwneeSchemeDto } from './ownable.schema';

@Injectable()
export class PermsService {
    constructor(
        @InjectModel(Perms.name) private permissionModel: Model<PermsDocument>
    ){}

    async create(owner: MultiSchemeDto, ownee: MultiSchemeDto,  ...perms: perm[]) {
        if (await this.permissionModel.findOne({ 
            owner: owner,
            ownee: ownee,
        }).exec()) {
            throw new HttpException("These two items are already linked", HttpStatus.CONFLICT);
        } else {
            return await new this.permissionModel({
                owner: owner,
                ownee: ownee,
                perms: perms,
            }).save();
        }   
    }

    async getPermDocument(owner:MultiSchemeDto, ownee: OwneeSchemeDto) {
        for (let perm of ownee.perms) {
            if (perm.owner.id === owner.id) {
                return await this.permissionModel.findById(perm.perms);
            }
        }
    }

    async checkPermissions(owner: MultiSchemeDto, ownee: OwneeSchemeDto, ...require: perm[]) {
        const permsDoc = await this.getPermDocument(owner, ownee);
        
        if (!permsDoc) {
            return false;
        }

        return require.every((requiredPerm)=>{permsDoc.perms.includes(requiredPerm)});
    }

    async requirePerms(owner: MultiSchemeDto, ownee: OwneeSchemeDto, ...require: perm[]) {
        if (await this.checkPermissions(owner, ownee, ...require) === false) {
            throw new HttpException("Lack permissions", HttpStatus.FORBIDDEN);
        }
    }

    async addPermissions(owner: MultiSchemeDto, ownee: OwneeSchemeDto, ...perms: perm[]) {
        const permsDoc = await this.getPermDocument(owner, ownee);

        if (permsDoc) {
            return await this.addPermissionsDoc(permsDoc, ...perms);
        }
    }

    async addPermissionsDoc(doc: PermsDocument, ...perms: perm[]) {
        perms = perms.filter((perm)=>!doc.perms.includes(perm));
        doc.perms.push(...perms);
        return await doc.save();
    }
}