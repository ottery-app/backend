import { Controller, Get, Param } from '@nestjs/common';
import {id} from '@ottery/ottery-dto';
import { AttendanceService } from './attendance.service';

@Controller('api/attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get('/:childId/at/:eventId')
  async requestChildDropOff(
    @Param("childId") childId: id,
    @Param("eventId") eventId: id,
  ) {
    return await this.attendanceService.getChildAtEvent(childId, eventId);
  }
}
