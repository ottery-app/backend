import { SetMetadata } from "@nestjs/common";

export const Seshless = () => SetMetadata("ignore-sesh", true);