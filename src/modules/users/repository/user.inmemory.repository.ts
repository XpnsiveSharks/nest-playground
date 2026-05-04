export type User = {
  name: string;
  email?: string;
};
export class Users {
  constructor(
    private readonly users: User[] = [
      { name: "bob", email: "bob@mail.com" },
      { name: "jane", email: "jane@mail.com" },
      { name: "sam" },
    ],
  ) {}
  list(): User[] {
    return [...this.users];
  }
  add(user: User): void {
    this.users.push(user);
  }
}
