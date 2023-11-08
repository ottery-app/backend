import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  dtoAssign,
  id,
  noId,
  SocialLinkHistoryDto,
  socialLinkState,
  UpdateLinkDto,
} from '@ottery/ottery-dto';
import { compareIds } from 'src/functions/compareIds';
import { normalizeId } from 'src/functions/normalizeId';
import { SocialLink, SocialLinkDocument } from './socialLink.schema';
import { CoreService } from '../core/core.service';

@Injectable()
export class SocialService {
  constructor(
    @InjectModel(SocialLink.name)
    private readonly socialLinkModel: Model<SocialLinkDocument>,
    private coreService: CoreService,
  ) {}

  private async findLinkByUserId(usera: id, userb: id) {
    const a = normalizeId(usera);
    const b = normalizeId(userb);
    return (
      (await this.socialLinkModel.findOne({ users: { $in: [a, b] } })) ||
      (await this.socialLinkModel.findOne({ users: { $in: [a, b] } }))
    );
  }

  async getOtherLinkedUser(link: SocialLinkDocument, unDesiredUser: id) {
    return link.users.filter((userId) => userId !== unDesiredUser)[0];
  }

  async findLinkById(linkId: id) {
    return await this.socialLinkModel.findById(linkId);
  }

  private async updateLink(activator: id, target: UpdateLinkDto) {
    let link = await this.findLinkByUserId(activator, target.target);

    const stamp: SocialLinkHistoryDto = {
      activator: normalizeId(activator).toString(),
      state: target.state,
      timestamp: new Date().getTime(),
    };

    if (link) {
      link.history.unshift(stamp);
    } else {
      link = new this.socialLinkModel({
        users: [normalizeId(activator), normalizeId(target.target)],
        history: [stamp],
      });

      await this.coreService.user.addSocialLink(activator, link._id);
      await this.coreService.user.addSocialLink(target.target, link._id);
    }

    return await link.save();
  }

  private queryLinkStatus(link: SocialLinkDocument): SocialLinkHistoryDto {
    if (link) {
      return link.history[0];
    } else {
      return dtoAssign(SocialLinkHistoryDto, {
        state: socialLinkState.NONE,
        activator: noId,
        timestamp: new Date().getTime(),
      });
    }
  }

  async updateLinkStatus(activator: id, target: UpdateLinkDto) {
    const link = await this.findLinkByUserId(activator, target.target);
    const status = this.queryLinkStatus(link).state;

    try {
      if (status === socialLinkState.NONE) {
        if (target.state === socialLinkState.REQUESTED) {
          return await this.updateLink(activator, target);
        } else {
          throw new Error(`${socialLinkState.REQUESTED}`);
        }
      } else if (status === socialLinkState.REQUESTED) {
        if (compareIds(link.history[0].activator, activator)) {
          //canceling own reqeust
          if (target.state === socialLinkState.NONE) {
            return await this.updateLink(activator, target);
          } else {
            throw new Error(socialLinkState.NONE);
          }
        } else {
          //accepting anothers request
          if (
            target.state === socialLinkState.ACCEPTED ||
            target.state === socialLinkState.NONE
          ) {
            return await this.updateLink(activator, target);
          } else {
            throw new Error(
              `either ${socialLinkState.ACCEPTED} or ${socialLinkState.NONE}`,
            );
          }
        }
      } else if (status === socialLinkState.ACCEPTED) {
        if (target.state === socialLinkState.NONE) {
          return await this.updateLink(activator, target);
        } else {
          throw new Error(`${socialLinkState.NONE}`);
        }
      }
    } catch (e) {
      throw new Error(`Not an acceptable state change. Must be ${e.message}`);
    }
  }

  async checkStatusByLink(link: SocialLinkDocument) {
    return this.queryLinkStatus(link);
  }

  async checkStatusOfUsers(activator: id, target: id) {
    const link = await this.findLinkByUserId(activator, target);
    return await this.checkStatusByLink(link);
  }

  async checkStatusById(linkId: id) {
    const link = await this.findLinkById(linkId);
    return await this.checkStatusByLink(link);
  }
}
