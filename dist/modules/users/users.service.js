"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const user_inmemory_repository_1 = require("./repository/user.inmemory.repository");
const logger_service_1 = require("../logger/logger.service");
let UsersService = class UsersService {
    featureFlagTypes;
    users;
    logger;
    constructor(featureFlagTypes, users, logger) {
        this.featureFlagTypes = featureFlagTypes;
        this.users = users;
        this.logger = logger;
    }
    getUsers(full = false) {
        const allUsers = this.users.list();
        if (full) {
            return allUsers;
        }
        if (this.featureFlagTypes.showEmail) {
            return allUsers.map((u) => ({ name: u.name, email: u.email }));
        }
        return allUsers.map((u) => ({ name: u.name }));
    }
    createUsers(createUsers) {
        if (this.featureFlagTypes.allowCreation) {
            this.logger.log("User Created:");
            this.users.add(createUsers);
        }
        else {
            throw new Error("User creation not allowed");
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("FEATURE_FLAGS")),
    __metadata("design:paramtypes", [Object, user_inmemory_repository_1.Users,
        logger_service_1.LoggerService])
], UsersService);
//# sourceMappingURL=users.service.js.map