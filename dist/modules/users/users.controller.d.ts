import { UsersService } from "./users.service";
import { CreateUsersDto } from "./dto/create-users.dto/create-users.dto";
export declare class UsersController {
    private readonly userService;
    constructor(userService: UsersService);
    getUsers(full?: string): import("./repository/user.inmemory.repository").User[];
    createUser(payload: CreateUsersDto): void;
}
