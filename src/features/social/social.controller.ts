import { Controller, Get, Patch, Body, Query } from '@nestjs/common';
import { id, socialLinkState, UpdateLinkDto, UserInfoDto, UserSocialStatusDto } from '@ottery/ottery-dto';
import { SocialService } from './social.service';
import { Sesh } from '../auth/sesh/Sesh.decorator';
import { SeshDocument } from '../auth/sesh/sesh.schema';
import { CoreService } from '../core/core.service';

@Controller('api/social')
export class SocialController {
    constructor(
        private socialService: SocialService,
        private coreService: CoreService,
    ) {}

    @Get('status')
    async getStatus(
        @Sesh() sesh: SeshDocument,
        @Query('userIds') userIds: id[], 
        @Query('types') types: socialLinkState[],
    ) {
        const selfId:id = sesh.userId;
        let users:any = new Map();

        if (userIds) {
            const found = await this.coreService.user.findManyById(userIds);
            found.forEach((user)=>{
                users.set(user._id, user);
            });
        }

        if (types) {
            const user = await this.coreService.user.findOneById(selfId);

            if (user.socialLinks) {
                for (let i = 0 ; i < user.socialLinks.length; i++) {
                    const linkId = user.socialLinks[i];
                    const link = await this.socialService.findLinkById(linkId);
    
                    if (types.includes((await this.socialService.checkStatusByLink(link)).state)) {
                        const linkedUserId = await this.socialService.getOtherLinkedUser(link, selfId);
                        const linkedUser = await this.coreService.user.findOneById(linkedUserId);
                        users.set(linkedUser._id, linkedUser);
                    }
                }
            }
        }

        const responce:UserSocialStatusDto[] = [];

        users = [...users.values()];
        for (let i = 0 ; i < users.length; i++) {
            const status = await this.socialService.checkStatusOfUsers(selfId, users[i]);
            responce.push({
                user: new UserInfoDto(users[i]),
                state: status,
            });
        }

        return responce;
    }

    @Patch('update')
    async updateStatus(
        @Sesh() sesh: SeshDocument,
        @Body() target: UpdateLinkDto,
    ) {
        const selfId = sesh.userId;
        return (await this.socialService.updateLinkStatus(selfId, target)).history[0];
    }
}