# Phase 7 — UserRepository (extends BaseRepository)

## Goal
Replace the current in-memory `UserRepository` with a real MongoDB-backed implementation that extends `BaseRepository`. The repository also handles mapping between `UserDocument` (Mongoose) and `User` (domain entity).

---

## Current State vs Target State

| | Current `user.repository.ts` | After This Phase |
|---|---|---|
| Data source | In-memory array | MongoDB via Mongoose |
| Base class | None | `BaseRepository<UserDocument>` |
| Methods | `findAll`, `findOne`, `exist` | All 7 base methods + user-specific ones |
| Mapping | None needed | Converts `UserDocument` → `User` entity |

---

## Step 1 — Replace `user.repository.ts`

Open `src/modules/user/repositories/user.repository.ts` and **replace the entire file** with:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseRepository } from '../../../database/repositories/base.repository';
import { UserDocument } from '../schemas/user.schema';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  // ─── User-specific queries ────────────────────────────────────────────────

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.findOne({ email: email.toLowerCase() });
    return doc ? this.toEntity(doc) : null;
  }

  async findActiveUsers(): Promise<User[]> {
    const docs = await this.findAll({ isActive: true });
    return docs.map(this.toEntity);
  }

  async findAllUsers(): Promise<User[]> {
    const docs = await this.findAll();
    return docs.map(this.toEntity);
  }

  async findUserById(id: string): Promise<User | null> {
    const doc = await this.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async emailExists(email: string): Promise<boolean> {
    return this.exists({ email: email.toLowerCase() });
  }

  // ─── Mapping: UserDocument → User entity ─────────────────────────────────

  private toEntity(doc: any): User {
    return new User({
      id: doc._id.toString(),
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      age: doc.age,
      isActive: doc.isActive,
    });
  }
}
```

---

## Step 2 — Understand the Key Parts

### `@InjectModel(UserDocument.name)`

```typescript
@InjectModel(UserDocument.name)
private readonly userModel: Model<UserDocument>
```

- `@InjectModel` is a NestJS decorator from `@nestjs/mongoose`.
- `UserDocument.name` resolves to the string `'UserDocument'` — it is the class name.
- This tells NestJS's DI container: "inject the Mongoose `Model` that was registered under the name `UserDocument`."
- You registered this model in `UserModule` using `MongooseModule.forFeature(...)` (done in Phase 8).

> **Why `UserDocument.name` instead of the string `'UserDocument'`?**
> Using the class reference prevents typos and ensures it automatically updates if you ever rename the class.

### `super(userModel)`

The parent class `BaseRepository` expects a `Model<T>` in its constructor:
```typescript
constructor(protected readonly model: Model<T>) {}
```
Calling `super(userModel)` passes the injected model up to the parent, where it is used by all the base methods (`findAll`, `findById`, etc.).

### The `toEntity` mapping method

```typescript
private toEntity(doc: any): User {
  return new User({
    id: doc._id.toString(),
    ...
  });
}
```

MongoDB documents have `_id` (an `ObjectId`), but your `User` entity has `id` (a string). The `toEntity` method converts between the two representations and constructs a plain `User` domain object.

This is the **only place in your codebase** that knows about `_id`. Services and controllers work with `User` entities that have a plain string `id`.

### The specific query methods

The base repository methods (`findAll`, `findOne`, etc.) return raw `UserDocument` objects. The user-specific methods (`findAllUsers`, `findByEmail`, etc.) go one step further and return `User` entities. This is the recommended pattern:

- **Base methods** — used internally within the repository for composability
- **Public methods** — return clean domain entities that the rest of the app uses

---

## Step 3 — Note on `.toLowerCase()` for Email

```typescript
await this.findOne({ email: email.toLowerCase() });
```

Your schema stores email in lowercase (`lowercase: true` in `@Prop`). When querying, you must also lowercase the input — otherwise a search for `User@Example.com` would miss the stored `user@example.com`.

---

## Step 4 — Verify TypeScript Compiles

```bash
yarn build
```

You may see an error like:
```
Cannot find module '../../../database/repositories/base.repository'
```

If so, double-check the relative import path from `src/modules/user/repositories/user.repository.ts` to `src/database/repositories/base.repository.ts`:

```
user.repository.ts is at:       src/modules/user/repositories/
base.repository.ts is at:       src/database/repositories/
Relative path from user to base: ../../../database/repositories/base.repository
```

Count the `../` levels: `user/repositories/` → `user/` → `modules/` → `src/` → then into `database/repositories/`.

---

## Step 5 — Do NOT Update `UserService` Yet

Phase 8 wires everything together — the module registration, the service update, and the final verification. Keep `user.service.ts` as-is for now.

---

## Done Checklist

- [ ] `user.repository.ts` replaced with the MongoDB-backed version
- [ ] `UserRepository` extends `BaseRepository<UserDocument>`
- [ ] Constructor uses `@InjectModel(UserDocument.name)` and calls `super(userModel)`
- [ ] `toEntity` private method maps `_id.toString()` → `id`
- [ ] User-specific methods return `User` entity (not raw document)
- [ ] `yarn build` passes (or path error identified and fixed)

Proceed to **Phase 8** once all are checked.
