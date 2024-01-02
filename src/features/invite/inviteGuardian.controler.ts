import { Controller, Post, Body, Param, HttpException, HttpCode, HttpStatus } from '@nestjs/common';
import { EmailDto, id, role, AcceptGuardianshipDto, socialLinkState } from '@ottery/ottery-dto';
import { SeshDocument } from '../auth/sesh/sesh.schema';
import { Sesh } from '../auth/sesh/Sesh.decorator';
import { Roles } from 'src/features/auth/roles/roles.decorator';
import { TokenService } from 'src/features/token/token.service';
import { TokenType } from 'src/features/token/token.schema';
import { AlertService } from 'src/features/alert/alert.service';
import { DeeplinkService } from 'src/features/deeplink/deeplink.service';
import { CoreService } from '../core/core.service';
import { FormFieldService } from '../form/form.service';
import { FormFlag } from '../form/form.flag.enum';
import { FormField } from '../form/form.schema';
import { DataService } from '../data/data.service';
import { SocialService } from '../social/social.service';

@Controller('api/invite/guardian')
export class InviteGuardianController {
  constructor(
    private coreService: CoreService,
    private tokenService: TokenService,
    private alertService: AlertService,
    private deeplinkService: DeeplinkService,
    private formService: FormFieldService,
    private dataService: DataService,
    private socialService: SocialService,
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
        TokenType.INVITE_GUARDIAN_FOR_CHILD,
        sesh.userId,
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
    const token = await this.tokenService.getToken(acceptGuardianshipDto.key, TokenType.INVITE_GUARDIAN_FOR_CHILD);
    if (await this.tokenService.validateToken(acceptGuardianshipDto.key, acceptGuardianshipDto.token, TokenType.INVITE_GUARDIAN_FOR_CHILD, true)) {
      const requiredData:FormField[] = (await this.formService.getBaseFields())[FormFlag.guardian] || [];

      const user = await this.coreService.user.get(userId);

      const missing = await this.dataService.getMissingFields(user, requiredData.map(formField=>formField._id));

      if (missing.length) {
        throw new HttpException(
          "Guardian is missing base info to be a guardian",
          HttpStatus.BAD_REQUEST,
        )
      } else {
        try {
          this.coreService.child.addGuardians(acceptGuardianshipDto.childId, [userId]);
        } catch (e) {
          throw e;
        }

        try {
          this.coreService.user.addChild(userId, acceptGuardianshipDto.childId);
        } catch (e) {
          throw e;
        }

        try {
          this.socialService.updateUserLink(
            userId,
            token.createdBy,
            socialLinkState.ACCEPTED,
          )
        } catch (e) {
          throw e;
        }

        return "success"
      }
    } else {
      throw new HttpException(
        'Not a valid invite',
        HttpStatus.BAD_REQUEST,
      );
    };
  }
}
