import { Global, Module } from "@nestjs/common";
import { CoreModule } from "../core/core.module";
import { SignupController } from "./signup.controller";
import { DataModule } from "../data/data.module";


@Global()
@Module({
  imports: [
    CoreModule,
    DataModule,
  ],
  controllers: [SignupController],
  providers: [],
  exports: [],
})
export class SignupModule {}
