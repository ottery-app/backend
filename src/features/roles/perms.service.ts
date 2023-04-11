import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Perms, PermsDocument } from './permission.schema';
import { makePermLinkDto, MultiSchemeDto } from 'ottery-dto';
import { perm, id } from 'ottery-dto';
import { OwneeSchemeDto } from './ownable.schema';

@Injectable()
export class PermsService {
    constructor(
        @InjectModel(Perms.name) private permissionModel: Model<PermsDocument>
    ){}

    async create(owner: MultiSchemeDto, ownee: OwneeSchemeDto,  ...perms: perm[]) {
        if (await this.permissionModel.findOne({ 
            owner: owner,
            ownee: ownee,
        }).exec()) {
            throw new HttpException("These two items are already linked", HttpStatus.CONFLICT);
        } else {
            const permLink = await new this.permissionModel({
                owner: owner,
                ownee: ownee,
                perms: perms,
            }).save();

            if (!ownee.document.perms) {
                ownee.document.perms = [];
            }

            ownee.document.perms.push(makePermLinkDto({
                owner,
                perms: permLink._id,
            }));

            await ownee.document.save();

            return permLink;
        }   
    }

    async hasPerm(permId: id, ...perms: perm[]) {
        let obj = await this.permissionModel.findById(permId).exec();
        
        if (!obj) {
            return false;
        } else {
            for (let i = 0; i < perms.length; i++) {
                if (obj.perms.includes(perms[i]) === false) {
                    return false
                }
            }
            return true
        }
    }

    async addPermBetween(owner: MultiSchemeDto, ownee: OwneeSchemeDto, ...perm: perm[]) {
        let permissions = await this.permissionModel.findOne({ 
            owner: owner,
            ownee: ownee,
        }).exec();

        if (permissions) { //the link exists
            return await this.addPermByObj(permissions, ...perm);
        } else { //the link does not exist
            let make = await this.create(owner, ownee, ...perm);
            return make;
        }
    }

    async addPermById(permId: id, ...perm: perm[]) {
        let permissions = await this.permissionModel.findById(permId).exec();
        return await this.addPermByObj(permissions, ...perm);
    }

    async addPermByObj(permissions: PermsDocument, ...perms: perm[]) {
        if (!permissions) {
            throw new HttpException("No permisions located for the provided info", HttpStatus.BAD_REQUEST)
        }

        perms
            .filter(perm=>permissions.perms.indexOf(perm) != -1)
            .forEach((perm)=>permissions.perms.push(perm));
            
        return await permissions.save();
    }

    async removePermBetween(owner: MultiSchemeDto, ownee: MultiSchemeDto, ...perm: perm[]) {
        let permissions = await this.permissionModel.findOne({ 
            owner: owner,
            ownee: ownee,
        }).exec()

        return await this.removePermByObj(permissions, ...perm);
    }

    async removePermById(permLink: id, ...perm: perm[]) {
        let permissions = await this.permissionModel.findById(permLink).exec();
        return await this.addPermByObj(permissions, ...perm);
    }

    async removePermByObj(permissions: PermsDocument, ...perms: perm[]) {
        if (!permissions) {
            throw new HttpException("No permisions located for the provided info", HttpStatus.BAD_REQUEST)
        }

        permissions.perms.filter(perm=>perms.indexOf(perm)===-1);
        return await permissions.save();
    }
}