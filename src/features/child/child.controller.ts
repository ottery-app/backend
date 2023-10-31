import { Controller, Get, Post, Body, Headers, Param, Query } from '@nestjs/common';
import { ChildService } from './child.service';
import { SeshService } from '../sesh/sesh.service';
import { UserService } from '../user/user.service';
import { id } from '@ottery/ottery-dto';
import { CreateChildDto } from '@ottery/ottery-dto';
import { User } from '../user/user.schema';
import { SeshDocument } from '../sesh/sesh.schema';
import { Sesh } from '../sesh/Sesh.decorator';
import { PermsService } from '../perms/perms.service';

@Controller('api/child')
export class ChildController {
    constructor(
        private userService: UserService,
        private childService: ChildService,
    ) {}

    @Post()
    async create (
        @Sesh() sesh: SeshDocument,
        @Body() createChildDto: CreateChildDto,
    ){
        try {
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

    @Get()
    async get (
        @Query('children') childIds: id[]
    ) {
        try {
            return await this.childService.findManyByIds(childIds);
        } catch (e) {
            throw e;
        }
    }
}