# Phase 6 — Generic Base Repository

## Goal
Build a reusable abstract repository layer that all future entity repositories extend. This eliminates copy-pasting standard CRUD logic across every repository and provides a consistent, type-safe interface for database operations.

---

## File Structure After This Phase

```
src/
└── database/
    ├── database.module.ts               ← Already exists (Phase 4)
    └── repositories/
        ├── base.repository.interface.ts  ← NEW: the contract
        └── base.repository.ts            ← NEW: the implementation
```

---

## Step 1 — Create the `repositories/` Directory

```bash
mkdir -p src/database/repositories
```

---

## Step 2 — Create the Base Repository Interface

Create `src/database/repositories/base.repository.interface.ts`:

```typescript
import { FilterQuery, UpdateQuery } from 'mongoose';

export interface IBaseRepository<T> {
  findAll(filter?: FilterQuery<T>): Promise<T[]>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: UpdateQuery<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  exists(filter: FilterQuery<T>): Promise<boolean>;
}
```

### Why an interface?

The interface defines the **contract** — what every repository promises to provide — without specifying how. Benefits:

1. **Consistency** — every repository (UserRepository, ProductRepository, etc.) has the same methods.
2. **Testability** — in unit tests, you can mock `IBaseRepository<T>` instead of the real class.
3. **Decoupling** — services depend on the interface, not the implementation. If you swap Mongoose for the native driver later, services don't change.

### `FilterQuery<T>` and `UpdateQuery<T>`

These are Mongoose-provided generic types:
- `FilterQuery<T>` — any valid MongoDB query filter (e.g., `{ email: 'x@y.com' }`, `{ age: { $gte: 18 } }`)
- `UpdateQuery<T>` — any valid MongoDB update operation (e.g., `{ $set: { isActive: false } }`)

Using these types instead of plain `object` gives you autocomplete on field names in the calling code.

---

## Step 3 — Create the Abstract Base Repository

Create `src/database/repositories/base.repository.ts`:

```typescript
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { Document } from 'mongoose';
import { IBaseRepository } from './base.repository.interface';

export abstract class BaseRepository<T extends Document>
  implements IBaseRepository<T>
{
  constructor(protected readonly model: Model<T>) {}

  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(filter).lean().exec() as Promise<T[]>;
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).lean().exec() as Promise<T | null>;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).lean().exec() as Promise<T | null>;
  }

  async create(data: Partial<T>): Promise<T> {
    const created = new this.model(data);
    return created.save() as Promise<T>;
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec() as Promise<T | null>;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const result = await this.model.exists(filter);
    return result !== null;
  }
}
```

---

## Step 4 — Understand the Key Decisions

### `abstract class` vs regular class

`BaseRepository` is `abstract` because:
- It is never instantiated directly — only subclasses are.
- It requires a `Model<T>` in the constructor, which only the subclass can provide (because only the subclass knows what model to inject).
- It can contain shared logic that subclasses inherit without reimplementing.

### `.lean().exec()` on read operations

```typescript
this.model.find(filter).lean().exec()
```

- `.lean()` tells Mongoose to return **plain JavaScript objects** instead of full Mongoose Documents.
- Without `.lean()`, every result is a `mongoose.Document` instance with getters, setters, `__v` versioning keys, and prototype methods attached — much heavier.
- `.lean()` is appropriate on **read operations** where you don't need to call `.save()` on the result.
- **Do not use `.lean()` on `create`** — you need the full document to call `.save()`.

### `{ new: true }` in `findByIdAndUpdate`

```typescript
this.model.findByIdAndUpdate(id, data, { new: true })
```

By default, `findByIdAndUpdate` returns the document **before** the update. `{ new: true }` tells Mongoose to return the document **after** the update. Almost always what you want.

### `delete` returning `boolean`

```typescript
const result = await this.model.findByIdAndDelete(id).exec();
return result !== null;
```

Returns `true` if a document was found and deleted, `false` if the ID didn't match any document. This is more useful to callers than returning the deleted document, since callers typically just need to know if the operation succeeded.

### `exists` using `model.exists()`

```typescript
const result = await this.model.exists(filter);
return result !== null;
```

`model.exists()` is more efficient than `findOne()` for existence checks — it uses a `{ _id: 1 }` projection internally and stops scanning as soon as a match is found.

---

## Step 5 — The Inheritance Chain

Here is how the pieces connect:

```
IBaseRepository<T>          ← interface (contract)
       ↑
BaseRepository<T>           ← abstract class (shared implementation)
       ↑
UserRepository              ← concrete class (User-specific logic)
```

- `UserRepository` extends `BaseRepository<UserDocument>`
- It gets `findAll`, `findOne`, `findById`, `create`, `update`, `delete`, `exists` for free
- It only needs to define User-specific queries (e.g., `findByEmail`)

---

## Step 6 — Verify TypeScript Compiles

```bash
yarn build
```

Expected: build passes. The base classes are not wired into the app yet (that happens in Phases 7 and 8), so nothing should break.

---

## Done Checklist

- [ ] `src/database/repositories/` directory created
- [ ] `base.repository.interface.ts` created with all 7 method signatures
- [ ] `base.repository.ts` created as abstract class implementing the interface
- [ ] `.lean()` is used on all read methods (`findAll`, `findOne`, `findById`, `update`)
- [ ] `create` does NOT use `.lean()` (needs full document for `.save()`)
- [ ] `{ new: true }` is set on `findByIdAndUpdate`
- [ ] `yarn build` passes with no errors

Proceed to **Phase 7** once all are checked.
