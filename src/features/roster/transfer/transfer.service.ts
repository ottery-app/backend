import { Injectable } from '@nestjs/common';
import { LocatableService } from '../../locatable/locatable.service';
import { attendanceType, noId } from '@ottery/ottery-dto';
import { AttendanceService } from '../attendance/attendance.service';

@Injectable()
export class TransferService {
  constructor(
    private locatableService: LocatableService,
    private attendanceService: AttendanceService,
  ) {}

  async dropoffActions(child, event, caretaker) {
    await this.locatableService.stamp(child, event, caretaker);
    await this.attendanceService.markAttendance(child, event, attendanceType.Present);
  }

  async pickupActions(child, caretaker) {
    await this.locatableService.stamp(child, noId, caretaker);
  }
}
