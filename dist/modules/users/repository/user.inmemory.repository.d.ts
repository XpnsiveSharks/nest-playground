export type User = {
    name: string;
    email?: string;
};
export declare class Users {
    private readonly users;
    constructor(users?: User[]);
    list(): User[];
    add(user: User): void;
}
