# Phase 3 — Environment Config with Joi Validation

## Goal
Set up `.env`-based configuration using `@nestjs/config` and validate required environment variables with Joi at application startup — so a misconfigured deployment fails loudly instead of silently.

---

## File Structure After This Phase

```
nest-playground/
├── .env                          ← your local secrets (never commit)
├── .env.example                  ← template to commit to git
└── src/
    └── config/
        └── env.validation.ts     ← Joi validation schema
```

---

## Step 1 — Create the `.env` File

In the **root** of your project (`~/Upskill/nest-playground`), create `.env`:

```env
# Application
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/nest-playground
```

> **Important:** The database name at the end of the URI (`nest-playground`) is what MongoDB will create automatically when you first write data to it. Choose a name relevant to your project.

---

## Step 2 — Create the `.env.example` File

Same directory, create `.env.example`:

```env
# Application
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/your-db-name
```

> **Why two files?**
> - `.env` holds your **actual values** — keep this out of git (it may contain passwords in future).
> - `.env.example` is a **template** committed to git so teammates know what vars are required.

---

## Step 3 — Add `.env` to `.gitignore`

Open your `.gitignore` (or create one if it doesn't exist) and ensure this line is present:

```
.env
```

Do **not** add `.env.example` — that one should be tracked by git.

---

## Step 4 — Create the `src/config/` Directory

```bash
mkdir -p src/config
```

---

## Step 5 — Create the Joi Validation Schema

Create `src/config/env.validation.ts`:

```typescript
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().default(3000),

  MONGODB_URI: Joi.string()
    .uri({ scheme: ['mongodb', 'mongodb+srv'] })
    .required()
    .messages({
      'string.uri': 'MONGODB_URI must be a valid MongoDB connection string',
      'any.required': 'MONGODB_URI is required — set it in your .env file',
    }),
});
```

### What each rule does:

| Rule | Meaning |
|---|---|
| `Joi.string().valid(...)` | Only accepts one of the listed values |
| `.default('development')` | Uses this value if the var is not set |
| `Joi.number().default(3000)` | Coerces `"3000"` string from env to number `3000` |
| `Joi.string().uri(...)` | Validates the string is a valid URI with the given schemes |
| `.required()` | Throws at startup if this var is missing |
| `.messages({})` | Custom human-readable error messages |

---

## Step 6 — Update `AppModule` to Use `ConfigModule`

Open `src/app.module.ts` and update it:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,   // show ALL validation errors at once, not just the first
        allowUnknown: true,  // don't throw on env vars not in your schema (e.g. system vars)
      },
    }),
    UserModule,
    // DatabaseModule will be added in Phase 4
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### Key options explained:

| Option | Effect |
|---|---|
| `isGlobal: true` | `ConfigModule` is available everywhere without importing it per-module |
| `validationSchema` | Joi schema to validate against on startup |
| `abortEarly: false` | Reports all missing/invalid vars at once — easier to fix |
| `allowUnknown: true` | Ignores system env vars like `PATH`, `HOME`, etc. that aren't in your schema |

---

## Step 7 — Verify Validation Works

### Test: what happens with a valid `.env`

```bash
yarn dev
```

Expected: app starts normally on port 3000. No errors about env vars.

---

### Test: what happens with a missing required var

Temporarily rename your `.env` or comment out `MONGODB_URI`:

```env
# MONGODB_URI=mongodb://localhost:27017/nest-playground
```

Run the app again:

```bash
yarn dev
```

Expected error (before the app starts):
```
Error: Config validation error: MONGODB_URI is required — set it in your .env file
```

The app should **refuse to start**. This is exactly the intended behavior — fail fast, fail loudly.

Restore `MONGODB_URI` in `.env` before moving on.

---

## Done Checklist

- [ ] `.env` exists in project root with `MONGODB_URI` set
- [ ] `.env.example` exists and is NOT in `.gitignore`
- [ ] `.env` IS in `.gitignore`
- [ ] `src/config/env.validation.ts` created with Joi schema
- [ ] `AppModule` imports `ConfigModule.forRoot(...)` with the validation schema
- [ ] `yarn dev` starts without errors
- [ ] Removing `MONGODB_URI` from `.env` causes a clear startup error

Proceed to **Phase 4** once all are checked.
