import type { FeatureFlagTypes } from "./constants/feature-flags";
import { Users } from "./repository/user.inmemory.repository";
import type { User } from "./repository/user.inmemory.repository";
import { CreateUsersDto } from "./dto/create-users.dto/create-users.dto";
import { LoggerService } from "../logger/logger.service";
export declare class UsersService {
    private readonly featureFlagTypes;
    private readonly users;
    private readonly logger;
    constructor(featureFlagTypes: FeatureFlagTypes, users: Users, logger: LoggerService);
    getUsers(full?: boolean): Array<User>;
    createUsers(createUsers: CreateUsersDto): void;
}
