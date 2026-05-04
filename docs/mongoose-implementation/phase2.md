# Phase 2 — Install NestJS Packages

## Goal
Install all required npm packages for Mongoose, config management, and environment validation into your existing NestJS project using yarn.

---

## Packages to Install

| Package | Role |
|---|---|
| `@nestjs/mongoose` | NestJS module wrapper for Mongoose — provides `MongooseModule`, `@InjectModel()`, `@Schema()`, `@Prop()` etc. |
| `mongoose` | The actual ODM (Object Document Mapper) library. `@nestjs/mongoose` depends on it. |
| `@nestjs/config` | NestJS module for loading `.env` files via `ConfigModule` and injecting values via `ConfigService`. |
| `joi` | Schema-based validation library — used to validate your env vars at startup. |

---

## Step 1 — Install Runtime Dependencies

From the root of your project (`~/Upskill/nest-playground`):

```bash
yarn add @nestjs/mongoose mongoose @nestjs/config joi
```

> All four are **runtime** dependencies (not dev-only) because they are needed when the app runs in production.

---

## Step 2 — Verify the Packages Were Added

```bash
cat package.json | grep -E '"@nestjs/mongoose|mongoose|@nestjs/config|joi'
```

Expected output (versions may differ):
```json
"@nestjs/config": "^x.x.x",
"@nestjs/mongoose": "^x.x.x",
"joi": "^x.x.x",
"mongoose": "^x.x.x",
```

---

## Step 3 — Check for TypeScript Type Availability

Mongoose 7+ ships its own TypeScript types — you do **not** need to install `@types/mongoose`. Verify:

```bash
ls node_modules/mongoose/types
```

You should see `.d.ts` files. No separate types package needed.

---

## Step 4 — Verify Joi Types

Joi ships its own types too. Check:

```bash
ls node_modules/joi/lib
```

If you see `index.d.ts` or similar — types are bundled.

---

## Step 5 — Rebuild the Project to Catch Any Issues

```bash
yarn build
```

Expected: build succeeds with no errors. The new packages don't touch any existing code yet — this is just a sanity check.

---

## What Each Package Actually Does at Runtime

### `@nestjs/mongoose`
Provides:
- `MongooseModule.forRoot()` / `forRootAsync()` — registers the global DB connection
- `MongooseModule.forFeature()` — registers a schema within a specific module
- `@Schema()` / `@Prop()` decorators — define your Mongoose schemas as TypeScript classes
- `@InjectModel()` — injects a Mongoose `Model<T>` into your classes

### `mongoose`
The actual ODM. It handles:
- Connection pooling to MongoDB
- Schema definition and validation
- Model methods: `find`, `findOne`, `create`, `findByIdAndUpdate`, etc.
- Document lifecycle hooks (pre/post save, etc.)

### `@nestjs/config`
Provides:
- `ConfigModule.forRoot()` — reads `.env` files and loads them into `process.env`
- `ConfigService` — injectable service for reading env values with type safety
- Supports validation schemas (integrates with Joi)

### `joi`
Used to define a validation schema for your env vars:
- Ensures required vars exist before the app starts
- Enforces types (string, number, URI format, etc.)
- Throws a clear error at startup if anything is missing or malformed

---

## Done Checklist

- [ ] `yarn add @nestjs/mongoose mongoose @nestjs/config joi` ran without errors
- [ ] All four packages appear in `package.json` under `dependencies`
- [ ] `yarn build` still passes

Proceed to **Phase 3** once all three are checked.
