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

@Controller('api/invite/guardian')
export class InviteGuardianController {
  constructor(
    private coreService: CoreService,
    private tokenService: TokenService,
    private alertService: AlertService,
    private deeplinkService: DeeplinkService,
  ) {}

  @Post('for/:childId')
  @Roles(role.LOGGEDIN)
  @Roles(role.GUARDIAN)
  async inviteGuardian(
    @Sesh() sesh: SeshDocument,
    @Param('childId') childId: id,
    @Body() emailDto: EmailDto,
  ) {
    const email = emailDto.email;
    const token = await this.tokenService.setToken(
        email,
        TokenType.INVITE_GUARDIAN_FOR_CHILD
    );

    const {firstName, lastName} = await this.coreService.user.get(sesh.userId);
    const invitorName = `${firstName} ${lastName}`;

    const { firstName: childFirstName, lastName: childLastName } = await this.coreService.child.get(childId);
    const childName = `${childFirstName} ${childLastName}`;

    // Send invite guardian link to the user
    const link = this.deeplinkService.createLink("/child/:childId/acceptguardianinvite", {token, key:email, childId});

    return await this.alertService.sendInviteGuardianForChildLink(
        email,
        link,
        invitorName,
        childName,
    );
  }

  @Post("accept/:userId")
  async acceptGuardianship(
    @Sesh() sesh: SeshDocument,
    @Param('userId') userId: id,
    @Body() acceptGuardianshipDto: AcceptGuardianshipDto,
  ) {
    if (await this.tokenService.validateToken(acceptGuardianshipDto.key, acceptGuardianshipDto.token, TokenType.INVITE_GUARDIAN_FOR_CHILD, true)) {
      this.coreService.child.addGuardians(acceptGuardianshipDto.childId, [userId]);
      this.coreService.user.addChild(userId, acceptGuardianshipDto.childId);

      return "success"
    } else {
      throw new HttpException(
        'Not a valid invite',
        HttpStatus.BAD_REQUEST,
      );
    };
  }
}
