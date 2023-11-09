import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { id, socialLinkState } from '@ottery/ottery-dto';
import { normalizeId } from 'src/functions/normalizeId';
import { SocialLink, SocialLinkDocument } from './social.schema';

@Injectable()
export class SocialService {
    constructor(
        @InjectModel(SocialLink.name) private readonly socialLinkModel: Model<SocialLinkDocument>,
    ) {}

    async updateUserLink(activator: id, target:id, state: socialLinkState) {
        let link = await this.findLinkBetween(activator, target);

        if (!link) {
            link = await this.socialLinkModel.create({
                users:[activator, target],
                history: [],
            });
        }

        link.history.push({
            activator: activator,
            state: state,
            timestamp: new Date().getTime(),
        });

        return await link.save();
    }

    async getLinksForUser(user: id) {
        const a = normalizeId(user);
        return await this.socialLinkModel.find({ users: { $in: [a] } });
    }

    async findLinkBetween(usera: id, userb:id) {
        const a = normalizeId(usera);
        const b = normalizeId(userb);
        return await this.socialLinkModel.findOne({ users: { $all: [a, b] } });
    }
}