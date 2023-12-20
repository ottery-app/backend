import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  AttendanceDto, attendanceType, id, noId,
} from '@ottery/ottery-dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CrudService } from 'src/features/interfaces/crud.service.inerface';
import { Attendance, AttendanceDocument } from './attendance.schema';


@Injectable()
export class AttendanceService implements CrudService {
  constructor(
    @InjectModel(Attendance.name) private readonly attendanceModel: Model<AttendanceDocument>,
  ) {}

  async markAttendance(child:id, event:id, status:attendanceType) {
    let today:any = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    const record = await this.attendanceModel.findOne({child, event, date:today});

    if (record) {
      await this.update(record._id, status);
    } else {
      await this.create({
        _id: undefined,
        child,
        event,
        status,
        date:today,
      });
    }
  }

  async create(object: AttendanceDto): Promise<Attendance> {
    const today = new Date(object.date);
    object.date = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    if (await this.attendanceModel.findOne({child:object.child, event: object.event, date:object.date})) {
      throw new HttpException("attendance record already exists", HttpStatus.CONFLICT);
    }

    return await this.attendanceModel.create(object);
  }

  async update(id, status) {
    const updatedAttendance = await this.attendanceModel.findByIdAndUpdate(
      id,
      { status: status },
      { new: true },
    );
  
    return updatedAttendance;
  }

  async getChildAtEvent(child:id, event:id): Promise<Attendance[]> {
    return await this.attendanceModel.find({child, event});
  }

  async get(id: id): Promise<Attendance> {
    return await this.attendanceModel.findById(id);
  }

  async getMany(ids: id[]): Promise<Attendance[]> {
    return await this.attendanceModel.find({ _id: { $in: ids } });
  }
}
