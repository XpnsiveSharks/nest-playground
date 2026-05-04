# Phase 4 — Database Module

## Goal
Create a dedicated `DatabaseModule` that establishes the MongoDB connection using Mongoose. This module reads the connection URI from `ConfigService` (set up in Phase 3) and is imported once in `AppModule` — keeping database concerns isolated from feature modules.

---

## File Structure After This Phase

```
src/
└── database/
    └── database.module.ts    ← NEW
```

---

## Step 1 — Create the `src/database/` Directory

```bash
mkdir -p src/database
```

---

## Step 2 — Create `database.module.ts`

Create `src/database/database.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),

        // Connection pool: max simultaneous connections to MongoDB
        maxPoolSize: 10,

        // How long to wait for a server to be found (ms)
        serverSelectionTimeoutMS: 5000,

        // How long a socket can be idle before being closed (ms)
        socketTimeoutMS: 45000,
      }),
    }),
  ],
})
export class DatabaseModule {}
```

### Why `forRootAsync` instead of `forRoot`?

| | `forRoot` | `forRootAsync` |
|---|---|---|
| Config source | Hardcoded string | Resolved at runtime via factory |
| Works with `ConfigService` | No | Yes |
| Safe for env vars | No | Yes |

`forRootAsync` waits for the `ConfigModule` to finish loading before creating the connection — so `ConfigService` is available and `MONGODB_URI` is already validated.

---

## Step 3 — Connection Options Explained

```typescript
maxPoolSize: 10
```
Mongoose maintains a **connection pool** — a set of reusable connections to MongoDB. Instead of opening a new TCP connection per request, it reuses pooled ones.

- Default is 5. For a development/playground project, 10 is more than enough.
- In production, tune this based on your load and MongoDB Atlas tier.

```typescript
serverSelectionTimeoutMS: 5000
```
If MongoDB is unreachable (e.g., service not running), Mongoose will wait this many milliseconds before throwing an error. 5 seconds gives you a fast failure rather than hanging indefinitely.

```typescript
socketTimeoutMS: 45000
```
If a query is running and the socket goes silent for this long, the connection is closed. Prevents silent hangs on slow/dropped queries.

---

## Step 4 — Register `DatabaseModule` in `AppModule`

Open `src/app.module.ts` and add the import:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { DatabaseModule } from './database/database.module';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    DatabaseModule,   // ← Add this
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

> **Order matters:** `ConfigModule.forRoot()` must come before `DatabaseModule` so `ConfigService` is available when `DatabaseModule` initializes its `forRootAsync` factory.

---

## Step 5 — Start the App and Verify the Connection

```bash
yarn dev
```

Look for this log line in the terminal:
```
[NestFactory] Starting Nest application...
[InstanceLoader] MongooseModule dependencies initialized
```

If Mongoose connected successfully, you will **not** see a connection error. The app should start cleanly.

---

## Step 6 — Test a Failed Connection (Optional but Recommended)

To confirm your error handling works, stop MongoDB temporarily:

```bash
sudo systemctl stop mongod
```

Then restart the app:
```bash
yarn dev
```

Within ~5 seconds (your `serverSelectionTimeoutMS`), you should see an error like:
```
MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

The app will fail to start. This is correct behavior — the app should not run without a database connection.

Start MongoDB again before proceeding:
```bash
sudo systemctl start mongod
```

---

## Architecture Note — Why a Separate `DatabaseModule`?

You could put `MongooseModule.forRootAsync(...)` directly in `AppModule`. However, a dedicated `DatabaseModule`:

1. **Separates concerns** — `AppModule` declares what modules exist; `DatabaseModule` handles how the DB connects.
2. **Easier to test** — you can swap `DatabaseModule` with a test module that uses an in-memory MongoDB.
3. **Easier to extend** — if you add read replicas, multiple connections, or seeding logic later, all of it lives in one place.

---

## Done Checklist

- [ ] `src/database/database.module.ts` created
- [ ] `DatabaseModule` imported in `AppModule` after `ConfigModule`
- [ ] `yarn dev` starts without errors
- [ ] MongoDB log shows the app connected (check `sudo journalctl -u mongod -f`)
- [ ] Stopping MongoDB causes a clear connection error within 5 seconds

Proceed to **Phase 5** once all are checked.
