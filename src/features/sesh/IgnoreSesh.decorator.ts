import { SetMetadata } from "@nestjs/common";

export const IgnoreSesh = () => SetMetadata("ignore-sesh", true);