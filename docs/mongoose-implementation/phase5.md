# Phase 5 — User Mongoose Schema

## Goal
Create a Mongoose schema for the `User` collection. The schema is kept **separate** from the existing `user.entity.ts` — the entity stays as a plain domain class, while the schema handles MongoDB-specific concerns like document shape, indexes, and timestamps.

---

## File Structure After This Phase

```
src/modules/user/
├── schemas/
│   └── user.schema.ts        ← NEW
├── entities/
│   └── user.entity.ts        ← UNCHANGED (plain domain class)
├── models/
│   └── user.model.ts         ← UNCHANGED
├── repositories/
│   └── user.repository.ts    ← Will be replaced in Phase 7
├── dto/
├── interface/
├── user.controller.ts
├── user.module.ts
└── user.service.ts
```

---

## Why Keep Entity and Schema Separate?

| File | Purpose | MongoDB coupling |
|---|---|---|
| `user.entity.ts` | Domain model — used across services, DTOs, tests | None — pure TypeScript |
| `user.schema.ts` | MongoDB document shape — used only in the repository layer | Yes — extends `Document` |

This separation means your service layer and business logic work with plain objects, not Mongoose documents. It makes testing easier and keeps your core logic portable.

---

## Step 1 — Create the `schemas/` Directory

```bash
mkdir -p src/modules/user/schemas
```

---

## Step 2 — Create `user.schema.ts`

Create `src/modules/user/schemas/user.schema.ts`:

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,       // auto-adds createdAt and updatedAt
  collection: 'users',   // explicit collection name (default would be 'userdocuments')
})
export class UserDocument extends Document {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({ required: true, min: 0, max: 150 })
  age: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
```

---

## Step 3 — Understand Each Decorator and Option

### `@Schema({ timestamps: true, collection: 'users' })`

- `timestamps: true` — Mongoose automatically adds `createdAt: Date` and `updatedAt: Date` to every document. You never manage these manually.
- `collection: 'users'` — Without this, Mongoose would name the collection `userdocuments` (lowercased + pluralized class name). Explicit is better.

### `@Prop(options)` — Field Definitions

| Field | Options Used | Why |
|---|---|---|
| `firstName` | `required: true, trim: true` | Must exist; leading/trailing spaces are stripped automatically |
| `lastName` | `required: true, trim: true` | Same as above |
| `email` | `required, unique, lowercase, index: true` | Must exist, no duplicates, stored lowercase for consistent querying, indexed for fast lookups |
| `age` | `required: true, min: 0, max: 150` | Must exist, MongoDB validates the range |
| `isActive` | `default: true` | Optional on insert — defaults to `true` if not provided |

### `extends Document`

`UserDocument extends Document` gives the class all Mongoose document methods (`save()`, `remove()`, `toObject()`, etc.) and makes the type compatible with `Model<UserDocument>`.

### `SchemaFactory.createForClass(UserDocument)`

This reads all `@Prop()` decorators from the class and builds a Mongoose `Schema` object. You then pass this `UserSchema` to `MongooseModule.forFeature()` in the module.

---

## Step 4 — Add a Compound Index (Optional but Recommended)

If you ever need to query users by both `lastName` and `isActive`, add a compound index **after** the `SchemaFactory.createForClass` call:

```typescript
export const UserSchema = SchemaFactory.createForClass(UserDocument);

// Compound index example — add only if you have a query that needs it
UserSchema.index({ lastName: 1, isActive: 1 });
```

> Indexes speed up queries but slow down writes. Only add them for fields you actually query/filter on.

---

## Step 5 — Understand the `_id` vs `id` Situation

MongoDB auto-generates a `_id` field of type `ObjectId` on every document. Mongoose also adds a virtual `id` getter that returns `_id.toString()` (the hex string).

Your existing `user.entity.ts` has `id: string`. When you map a MongoDB document to your entity, you'll do:

```typescript
const entity = new User({
  id: document._id.toString(),   // or document.id
  firstName: document.firstName,
  // ...
});
```

You will set this mapping up in Phase 7 (the repository).

---

## Step 6 — Verify TypeScript Compiles the Schema

```bash
yarn build
```

The build should pass. The schema file doesn't wire into the app yet (that happens in Phase 8 when you update `UserModule`) — you're just confirming the TypeScript is valid.

---

## Done Checklist

- [ ] `src/modules/user/schemas/user.schema.ts` created
- [ ] `UserDocument` class has all five fields with correct `@Prop()` options
- [ ] `UserSchema` is exported using `SchemaFactory.createForClass(UserDocument)`
- [ ] `timestamps: true` and `collection: 'users'` are set in `@Schema()`
- [ ] `email` field has `index: true` and `unique: true`
- [ ] `yarn build` passes with no errors

Proceed to **Phase 6** once all are checked.
