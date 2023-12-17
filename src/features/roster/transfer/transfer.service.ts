import { Injectable } from '@nestjs/common';
import { LocatableService } from '../../locatable/locatable.service';
import { attendanceType, id, noId } from '@ottery/ottery-dto';
import { AttendanceService } from '../attendance/attendance.service';
import { Child } from 'src/features/core/child/child.schema';

@Injectable()
export class TransferService {
  constructor(
    private locatableService: LocatableService,
    private attendanceService: AttendanceService,
  ) {}

  async dropoffActions(child: Child, event:id, caretaker:id) {
    await this.locatableService.stamp(child, event, caretaker);
    await this.attendanceService.markAttendance(child._id, event, attendanceType.Present);
  }

  async pickupActions(child:Child, caretaker:id) {
    await this.locatableService.stamp(child, noId, caretaker);
  }
}
