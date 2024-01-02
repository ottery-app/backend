import { Controller, Get, Post, Body, Query, Param, Patch } from '@nestjs/common';
import { ChildService } from './child.service';
import { UserService } from '../user/user.service';
import { DataFieldDto, IdArrayDto, id } from '@ottery/ottery-dto';
import { CreateChildDto } from '@ottery/ottery-dto';
import { SeshDocument } from '../../auth/sesh/sesh.schema';
import { Sesh } from '../../auth/sesh/Sesh.decorator';
import { DataController } from 'src/features/data/data.controller';
import { DataService } from 'src/features/data/data.service';

@Controller('api/child')
export class ChildController implements DataController {
  constructor(
    private userService: UserService,
    private childService: ChildService,
    private dataService: DataService,
  ) {}

  @Get(":childId/data")
  async getData(
    @Param('childId') childId: id,
  ) {
    return (await this.childService.get(childId)).data;
  }

  @Get(":childId/data/missing")
  async getMissingData(
    @Param('childId') childId: id,
    @Query("desired") desired:id[],
  ) {
    const child  = await this.childService.get(childId);
    return await this.dataService.getMissingFields(child, desired);
  }

  @Patch(":childId/data")
  async updateData(
    @Param('childId') childId: id,
    @Body() data: DataFieldDto[]
  ) {
    const child = await this.childService.get(childId);
    child.data = await this.dataService.update(child, data);
    await this.childService.update(childId, child);
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
  
  //NOT SURE THIS IS USED?????
  // @Post(':childId/addGuardians')
  // async addGuardians(@Param('childId') childId: id, @Body() body: IdArrayDto) {
  //   const ids = (await this.userService.getMany(body.ids)).map(
  //     (user) => user._id,
  //   );
  //   this.childService.addGuardians(childId, ids);
  // }
}
