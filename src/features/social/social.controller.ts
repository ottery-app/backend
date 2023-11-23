import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { id, socialLinkState, UpdateLinkDto } from '@ottery/ottery-dto';
import { SocialService } from './social.service';
import { Sesh } from '../auth/sesh/Sesh.decorator';
import { SeshDocument } from '../auth/sesh/sesh.schema';

@Controller('api/social')
export class SocialController {
  constructor(private socialService: SocialService) {}

  @Get('status/user/:userId')
  async getByUser(@Sesh() sesh: SeshDocument, @Param('userId') userId: id) {
    return await this.socialService.findLinkBetween(sesh.userId, userId);
  }

  @Get('status/type/:type')
  async getByType(
    @Sesh() sesh: SeshDocument,
    @Param('type') type: socialLinkState,
  ) {
    let links = await this.socialService.getLinksForUser(sesh.userId);
    links = links.filter((link) => type === link.history[0].state);
    return links;
  }

  @Patch('update')
  async updateStatus(
    @Sesh() sesh: SeshDocument,
    @Body() target: UpdateLinkDto,
  ) {
    const selfId = sesh.userId;
    return await this.socialService.updateUserLink(
      selfId,
      target.target,
      target.state,
    );
  }
}
