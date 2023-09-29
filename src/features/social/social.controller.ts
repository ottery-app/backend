import { Controller, Get, Param, Headers, Patch, Body, Query, Post } from '@nestjs/common';
import { id, MessageDto, socialLinkState, UpdateLinkDto, UserInfoDto, UserSocialStatusDto } from 'ottery-dto';
import { SeshService } from '../sesh/sesh.service';
import { SocialService } from './social.service';
import { UserService } from '../user/user.service';
import { Sesh } from '../sesh/Sesh.decorator';
import { SeshDocument } from '../sesh/sesh.schema';

@Controller('api/social')
export class SocialController {
    constructor(
        private socialService: SocialService,
        private seshService: SeshService,
        private userService: UserService,
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
            const found = await this.userService.findManyById(userIds);
            found.forEach((user)=>{
                users.set(user._id, user);
            });
        }

        if (types) {
            const user = await this.userService.findOneById(selfId);

            if (user.socialLinks) {
                for (let i = 0 ; i < user.socialLinks.length; i++) {
                    const linkId = user.socialLinks[i];
                    const link = await this.socialService.findLinkById(linkId);
    
                    if (types.includes((await this.socialService.checkStatusByLink(link)).state)) {
                        const linkedUserId = await this.socialService.getOtherLinkedUser(link, selfId);
                        const linkedUser = await this.userService.findOneById(linkedUserId);
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