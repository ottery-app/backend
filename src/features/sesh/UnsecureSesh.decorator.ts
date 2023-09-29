import { SetMetadata } from "@nestjs/common";

export const UnsecureSesh = () => SetMetadata("ignore-sesh-security", true);