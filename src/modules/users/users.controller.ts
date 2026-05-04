import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUsersDto } from "./dto/create-users.dto/create-users.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  getUsers(@Query("full") full?: string) {
    const isFull = full === "true";
    return this.userService.getUsers(isFull);
  }

  @Post()
  createUser(@Body() payload: CreateUsersDto) {
    return this.userService.createUsers(payload);
  }
}
