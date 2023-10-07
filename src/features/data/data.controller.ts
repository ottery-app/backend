import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { DataFieldDto, id, MultiSchemeDto } from '@ottery/ottery-dto';
import {DataService} from './data.service';

@Controller('api/data')
export class DataController {
    constructor(
        private dataService: DataService,
    ) {}

    @Get('id/:id/missing')
    async getMissingFieldsbyId(
        @Param('id') dataId: id,
        @Query('desired') desired: id[],
    ) {
        desired = desired || [];
        return await this.dataService.findMissingDataForId(dataId, desired);
    }

    @Get('owner/:id/missing')
    async getMissingFieldByOwner(
        @Param('id') ownerId: id,
        @Query('desired') desired: id[],
    ) {
        desired = desired || [];
        return await this.dataService.findMissingDataForOwner(ownerId, desired);
    }

    @Patch('id/:id')
    async addDataFieldsById(
        @Param('id') dataId: id,
        @Body() dataFieldDtos: DataFieldDto[],
    ) {
        dataFieldDtos = dataFieldDtos || [];
        return await this.dataService.setDataById(dataId, dataFieldDtos);
    }

    @Patch('owner/:id')
    async addDataFieldsByOwner(
        @Param('id') ownerId: id,
        @Body() dataFieldDtos: DataFieldDto[],
    ) {
        dataFieldDtos = dataFieldDtos || [];
        return await this.dataService.setDataByOwner(ownerId, dataFieldDtos);
    }
}