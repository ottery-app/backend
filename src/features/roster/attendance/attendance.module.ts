import { Module } from "@nestjs/common";
import { AttendanceService } from "../attendance/attendance.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Attendance, AttendanceSchema } from "./attendance.schema";
import { AttendanceController } from "./attendance.controller";


@Module({
  imports: [
    MongooseModule.forFeature([
        { name: Attendance.name, schema: AttendanceSchema },
    ])
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}