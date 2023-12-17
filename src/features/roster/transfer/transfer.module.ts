import { Module } from "@nestjs/common";
import { TransferService } from "./transfer.service";
import { LocatableModule } from "src/features/locatable/locatable.module";
import { AttendanceModule } from "../attendance/attendance.module";


@Module({
  imports: [LocatableModule, AttendanceModule],
  controllers: [],
  providers: [TransferService],
  exports: [TransferService],
})
export class TransferModule {}