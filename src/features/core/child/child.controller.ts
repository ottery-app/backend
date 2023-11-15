import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ChildService } from './child.service';
import { UserService } from '../user/user.service';
import { EmailDto, IdArrayDto, id, role } from '@ottery/ottery-dto';
import { CreateChildDto } from '@ottery/ottery-dto';
import { SeshDocument } from '../../auth/sesh/sesh.schema';
import { Sesh } from '../../auth/sesh/Sesh.decorator';
import { Roles } from 'src/features/auth/roles/roles.decorator';

@Controller('api/child')
export class ChildController {
  constructor(
    private userService: UserService,
    private childService: ChildService,
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
  // @Roles(role.LOGGEDIN)
  // @Roles(role.GUARDIAN)
  async inviteGuardian(
    // @Sesh() sesh: SeshDocument,
    @Param('childId') childId: id,
    @Body() emailDto: EmailDto,
  ) {
    // return this.childService.inviteGuardian(sesh.userId, childId, emailDto);
    return this.childService.inviteGuardian(
      '6529153792cd533489f44aae',
      childId,
      emailDto,
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
