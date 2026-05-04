import { Injectable, Inject } from "@nestjs/common";
import type { FeatureFlagTypes } from "./constants/feature-flags";
import { Users } from "./repository/user.inmemory.repository";
import type { User } from "./repository/user.inmemory.repository";
import { CreateUsersDto } from "./dto/create-users.dto/create-users.dto";
import { LoggerService } from "../logger/logger.service";

@Injectable()
export class UsersService {
  constructor(
    @Inject("FEATURE_FLAGS")
    private readonly featureFlagTypes: FeatureFlagTypes,
    private readonly users: Users,
    private readonly logger: LoggerService,
  ) {}

  getUsers(full = false): Array<User> {
    const allUsers = this.users.list();

    if (full) {
      return allUsers;
    }

    if (this.featureFlagTypes.showEmail) {
      return allUsers.map((u) => ({ name: u.name, email: u.email }));
    }

    return allUsers.map((u) => ({ name: u.name }));
  }

  createUsers(createUsers: CreateUsersDto): void {
    if (this.featureFlagTypes.allowCreation) {
      this.logger.log("User Created:");
      this.users.add(createUsers);
    } else {
      throw new Error("User creation not allowed");
    }
  }
}
