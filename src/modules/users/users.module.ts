import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { FeatureFlag } from "./constants/feature-flags";
import { Users } from "./repository/user.inmemory.repository";
import { LoggerService } from "../logger/logger.service";

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    LoggerService,
    Users,
    {
      provide: "FEATURE_FLAGS",
      useValue: FeatureFlag,
    },
  ],
})
export class UsersModule {}
