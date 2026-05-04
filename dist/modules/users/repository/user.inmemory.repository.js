"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
class Users {
    users;
    constructor(users = [
        { name: "bob", email: "bob@mail.com" },
        { name: "jane", email: "jane@mail.com" },
        { name: "sam" },
    ]) {
        this.users = users;
    }
    list() {
        return [...this.users];
    }
    add(user) {
        this.users.push(user);
    }
}
exports.Users = Users;
//# sourceMappingURL=user.inmemory.repository.js.map