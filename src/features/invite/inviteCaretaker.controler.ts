import { Controller, Post, Body, Param, HttpException, HttpCode, HttpStatus } from '@nestjs/common';
import { EmailDto, id, role, AcceptGuardianshipDto } from '@ottery/ottery-dto';
import { SeshDocument } from '../auth/sesh/sesh.schema';
import { Sesh } from '../auth/sesh/Sesh.decorator';
import { Roles } from 'src/features/auth/roles/roles.decorator';
import { TokenService } from 'src/features/token/token.service';
import { TokenType } from 'src/features/token/token.schema';
import { AlertService } from 'src/features/alert/alert.service';
import { DeeplinkService } from 'src/features/deeplink/deeplink.service';
import { CoreService } from '../core/core.service';

@Controller('api/invite/event')
export class InviteCaretakerController {
  constructor(
    private coreService: CoreService,
    private tokenService: TokenService,
    private alertService: AlertService,
    private deeplinkService: DeeplinkService,
  ) {}

  @Post('caretaker/for/:eventId')
  async inviteCaretaker(
    @Sesh() sesh: SeshDocument,
    @Param('eventId') eventId: id,
    @Body() emailDto: EmailDto,
  ) {
    const email = emailDto.email;
    const token = await this.tokenService.setToken(
        email,
        TokenType.INVITE_CARETAKER_TO_EVENT,
    );

    const link = this.deeplinkService.createLink("/event/signup/:eventId", {
        eventId,
        token,
        email,
        type: "caretaker"
    });

    const event = await this.coreService.event.get(eventId);

    return await this.alertService.sendInviteCaretakerToEvent(
        email,
        link,
        event.summary,
    );
  }
}