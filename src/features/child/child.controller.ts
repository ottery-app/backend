import { Controller, Get, Post, Body, Headers, Param, Query } from '@nestjs/common';
import { ChildService } from './child.service';
import { SeshService } from '../sesh/sesh.service';
import { UserService } from '../user/user.service';
import { id } from 'ottery-dto';
import { CreateChildDto } from 'ottery-dto';
import { User } from '../user/user.schema';
import { DataService } from '../data/data.service';

@Controller('api/child')
export class ChildController {
    constructor(
        private userService: UserService,
        private childService: ChildService,
        private seshService: SeshService,
        private dataService: DataService,
    ) {}

    @Post()
    async create (
        @Headers('Id') seshId: id,
        @Body() createChildDto: CreateChildDto,
    ){
        try {
            //prep
            const sesh = this.seshService.getSeshInfo(seshId);

            //make
            let child = await this.childService.create({
                id: sesh.userId,
                ref: User.name, 
            }, createChildDto);

            //add child to user
            this.userService.addChildById(sesh.userId, child._id);

            //update
            return child
        } catch (e) {
            throw e;
        }
    }

    //TODO this doesnt even validate the sesh :/
    @Get()
    async get (
        @Param('id') id: id,
        @Query('children') childIds: id[]
    ) {
        try {
            return await this.childService.findManyByIds(childIds);
        } catch (e) {
            throw e;
        }
    }
}