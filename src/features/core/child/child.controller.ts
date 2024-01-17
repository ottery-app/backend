import { Controller, Get, Post, Body, Query, Param, Patch } from '@nestjs/common';
import { ChildService } from './child.service';
import { UserService } from '../user/user.service';
import { DataFieldDto, IdArrayDto, ImageDto, id, inputType, perm, role } from '@ottery/ottery-dto';
import { CreateChildDto } from '@ottery/ottery-dto';
import { SeshDocument } from '../../auth/sesh/sesh.schema';
import { Sesh } from '../../auth/sesh/Sesh.decorator';
import { DataController } from 'src/features/data/data.controller';
import { DataService } from 'src/features/data/data.service';
import { isTSExpressionWithTypeArguments } from '@babel/types';
import { PermsService } from 'src/features/auth/perms/perms.service';

@Controller('api/child')
export class ChildController implements DataController {
  constructor(
    private userService: UserService,
    private childService: ChildService,
    private dataService: DataService,
    private permsService: PermsService,
  ) {}

  @Get(":childId/data")
  async getData(
    @Param('childId') childId: id,
    @Sesh() sesh: SeshDocument,
  ) {
    const child = await this.childService.get(childId);
    await this.permsService.requireValidAction(sesh.userId, child._id, perm.READ);
    return child?.data;
  }

  @Get(":childId/data/missing")
  async getMissingData(
    @Param('childId') childId: id,
    @Query("desired") desired:id[],
    @Sesh() sesh: SeshDocument,
  ) {
    const child  = await this.childService.get(childId);
    await this.permsService.requireValidAction(sesh.userId, childId, perm.READ);
    return await this.dataService.getMissingFields(child, desired);
  }

  @Patch(":childId/data")
  async updateData(
    @Param('childId') childId: id,
    @Body() data: DataFieldDto[],
    @Sesh() sesh: SeshDocument,
  ) {

    try {
      const child = await this.childService.get(childId);
      child.data = await this.dataService.update(child, data);
      for (let i = 0; i < child.data.length; i++) {
        if (child.data[i].type === inputType.PICTURE) {
          const image:ImageDto = child.data[i].value;
          child.pfp = image;
        }
      }

      await this.permsService.requireValidAction(sesh.userId, child._id, perm.EDIT);
      await this.childService.update(childId, child);
      return "success";
    } catch (e) {
      return "false";
    }
  }

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

      await this.permsService.addPerms(sesh.userId, child._id, perm.SUPER);

      //update
      return child;
    } catch (e) {
      throw e;
    }
  }

  @Get()
  async get(
    @Query('children') childIds: id[],
    @Sesh() sesh: SeshDocument,
  ) {
    try {
      return (await this.childService.getMany(childIds)).filter(async (child)=>await this.permsService.validateAction(sesh.userId, child._id, perm.READ));
    } catch (e) {
      throw e;
    }
  }
}
