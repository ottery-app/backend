import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ChildService } from './child.service';
import { UserService } from '../user/user.service';
import { EmailDto, IdArrayDto, id, role } from '@ottery/ottery-dto';
import { CreateChildDto } from '@ottery/ottery-dto';
import { SeshDocument } from '../../auth/sesh/sesh.schema';
import { Sesh } from '../../auth/sesh/Sesh.decorator';
import { Roles } from 'src/features/auth/roles/roles.decorator';
import { TokenService } from 'src/features/token/token.service';
import { TokenType } from 'src/features/token/token.schema';
import { AlertService } from 'src/features/alert/alert.service';
import { DeeplinkService } from 'src/features/deeplink/deeplink.service';

@Controller('api/child')
export class ChildController {
  constructor(
    private userService: UserService,
    private childService: ChildService,
    private tokenService: TokenService,
    private alertService: AlertService,
    private deeplinkService: DeeplinkService,
  ) {}

  @Post()
  async create(
    @Sesh() sesh: SeshDocument,
    @Body() createChildDto: CreateChildDto,
  ) {
    try {
      //make
      const child = await this.childService.create({
        ...createChildDto,
        primaryGuardian: sesh.userId,
      });

      //add child to user
      this.userService.addChild(sesh.userId, child._id);

      //update
      return child;
    } catch (e) {
      throw e;
    }
  }

  @Get()
  async get(@Query('children') childIds: id[]) {
    try {
      return await this.childService.getMany(childIds);
    } catch (e) {
      throw e;
    }
  }

  @Post(':childId/invite-guardian')
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

    const {firstName, lastName} = await this.userService.get(sesh.userId);
    const invitorName = `${firstName} ${lastName}`;

    const { firstName: childFirstName, lastName: childLastName } = await this.childService.get(childId);
    const childName = `${childFirstName} ${childLastName}`;

    // Send invite guardian link to the user
    const link = this.deeplinkService.createLink("/child/:childId/acceptguardianinvite", {token, email, childId});

    return await this.alertService.sendInviteGuardianForChildLink(
        email,
        link,
        invitorName,
        childName,
    );
  }

  @Post(':childId/addGuardians')
  async addGuardians(@Param('childId') childId: id, @Body() body: IdArrayDto) {
    const ids = (await this.userService.getMany(body.ids)).map(
      (user) => user._id,
    );
    this.childService.addGuardians(childId, ids);
  }
}
