import { Module } from "@nestjs/common";
import { TransferService } from "./transfer.service";
import { AttendanceService } from "../attendance/attendance.service";
import { LocatableModule } from "src/features/locatable/locatable.module";


@Module({
  imports: [LocatableModule, AttendanceService],
  controllers: [],
  providers: [TransferService],
  exports: [],
})
export class TransferModule {}