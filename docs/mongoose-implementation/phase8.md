# Phase 8 — Wire Everything Together

## Goal
Register the Mongoose schema in `UserModule`, update `UserService` to use the real repository, and run a full end-to-end verification that data flows from the NestJS controller all the way to MongoDB and back.

---

## Step 1 — Update `UserModule`

Open `src/modules/user/user.module.ts` and replace it with:

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './repositories/user.repository';
import { UserDocument, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserRepository],
})
export class UserModule {}
```

### What `MongooseModule.forFeature` does

```typescript
MongooseModule.forFeature([
  { name: UserDocument.name, schema: UserSchema },
])
```

This registers the `UserSchema` under the name `'UserDocument'` within the scope of `UserModule`. When NestJS processes `@InjectModel(UserDocument.name)` in `UserRepository`, it looks up this registration and injects the corresponding Mongoose `Model`.

| Part | Role |
|---|---|
| `name: UserDocument.name` | The token used to identify this model in the DI container |
| `schema: UserSchema` | The Mongoose Schema built in Phase 5 |

> `forFeature` is scoped — `UserSchema` is only available to providers inside `UserModule`. Other modules do not get access to the User model unless you export it.

### Why `exports: [UserRepository]`

If another module ever needs to query users (e.g., an `AuthModule` that checks user credentials), it can import `UserModule` and inject `UserRepository` directly. Without this export, `UserRepository` would be private to `UserModule`.

---

## Step 2 — Update `UserService`

Open `src/modules/user/user.service.ts`. Update it to inject and use `UserRepository`:

```typescript
import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.findAllUsers();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findUserById(id);
  }

  async findActive(): Promise<User[]> {
    return this.userRepository.findActiveUsers();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
```

> Keep `UserService` thin — it delegates to `UserRepository`. Business logic (validation, transformations) can be added here later without touching the repository.

---

## Step 3 — Check `UserController`

Open `src/modules/user/user.controller.ts`. Make sure its method calls match the updated `UserService`. If the controller calls `findAll()`, `findOne(id)` — these are already implemented in the updated service.

If your controller calls methods that no longer exist in the service, update it to use the new method names.

---

## Step 4 — Start the App

```bash
yarn dev
```

Expected output:
```
[NestFactory] Starting Nest application...
[InstanceLoader] MongooseModule dependencies initialized
[InstanceLoader] UserModule dependencies initialized
[NestApplication] Nest application successfully started
```

No errors means:
- Config validated ✓
- MongoDB connected ✓
- `UserDocument` model registered in `UserModule` ✓
- `UserRepository` injected into `UserService` ✓

---

## Step 5 — Seed a Test Document via `mongosh`

Before hitting the API, seed one user directly in MongoDB to confirm the schema and connection work:

```bash
mongosh
```

```js
use nest-playground

db.users.insertOne({
  firstName: "Marynelle",
  lastName: "Aban",
  email: "marynelle@gmail.com",
  age: 28,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Verify it was inserted:
```js
db.users.find().pretty()
```

You should see the document with an auto-generated `_id`.

Type `exit` to leave the shell.

---

## Step 6 — Hit the API and Verify

Use curl, Postman, or your browser to call your user endpoint:

```bash
curl http://localhost:3000/users
```

Expected: JSON array containing the user you seeded.

```bash
curl http://localhost:3000/users/<the-_id-from-step-5>
```

Expected: The single user object.

If you get data back — everything is wired correctly end-to-end.

---

## Step 7 — Verify Index Was Created

Back in `mongosh`:

```bash
mongosh
```

```js
use nest-playground
db.users.getIndexes()
```

Expected output includes two entries:
1. The default `_id` index (always created by MongoDB)
2. A unique index on `email` (created by your `index: true` + `unique: true` in the schema)

```json
[
  { "key": { "_id": 1 }, "name": "_id_" },
  { "key": { "email": 1 }, "name": "email_1", "unique": true }
]
```

---

## Done Checklist

- [ ] `UserModule` imports `MongooseModule.forFeature(...)` with `UserDocument` and `UserSchema`
- [ ] `UserRepository` is listed in `providers` in `UserModule`
- [ ] `UserService` injects `UserRepository` and delegates all queries to it
- [ ] `yarn dev` starts without errors
- [ ] Seeded document is returned by the API
- [ ] `db.users.getIndexes()` shows the email index

Proceed to **Phase 9** once all are checked.
