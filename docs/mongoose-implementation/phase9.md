# Phase 9 — Best Practices Reference

## Goal
A consolidated reference of best practices applied throughout this implementation — with explanations of why each decision was made. Use this as a checklist when adding new modules or reviewing existing code.

---

## 1. Connection Management

### Connection Pooling
```typescript
// database.module.ts
maxPoolSize: 10,
serverSelectionTimeoutMS: 5000,
socketTimeoutMS: 45000,
```

| Setting | Why |
|---|---|
| `maxPoolSize` | Reuses TCP connections instead of opening/closing one per request. Default is 5; 10 suits most apps. |
| `serverSelectionTimeoutMS` | Fast failure if MongoDB is unreachable — 5s is enough to fail on startup, not hang indefinitely. |
| `socketTimeoutMS` | Prevents silent hangs when a query stalls — closes the connection after 45s of inactivity. |

**Rule:** Always configure these three settings. The Mongoose defaults are either too permissive (timeout) or not tuned for NestJS apps.

---

## 2. Schema Design

### Always Use `timestamps: true`
```typescript
@Schema({ timestamps: true })
```
Every collection gets `createdAt` and `updatedAt` for free. Never manage these manually.

### Explicit `collection` Name
```typescript
@Schema({ collection: 'users' })
```
Without this, Mongoose generates a name by lowercasing and pluralizing the class name. `UserDocument` → `userdocuments`. Always be explicit.

### Index Fields You Query On
```typescript
@Prop({ index: true })
email: string;
```
Only add indexes on fields used in `find` filters or sort operations. Indexes speed up reads but cost write performance and storage.

### Compound Indexes for Multi-Field Queries
```typescript
// After SchemaFactory.createForClass()
UserSchema.index({ lastName: 1, isActive: 1 });
```
If you ever filter by `{ lastName: 'Aban', isActive: true }`, a compound index is significantly faster than two separate single-field indexes.

### Validation at the Schema Level
```typescript
@Prop({ min: 0, max: 150 })
age: number;

@Prop({ trim: true, lowercase: true })
email: string;
```
Mongoose validates and transforms values before they hit MongoDB. Use `required`, `min`, `max`, `trim`, `lowercase` to enforce data quality at the ODM layer — not just in DTO validators.

---

## 3. Repository Pattern

### Keep Base Methods Returning Documents, Public Methods Returning Entities
```
BaseRepository    → returns UserDocument (raw Mongoose result)
UserRepository    → returns User entity (domain object)
```
Services and controllers never handle Mongoose documents directly. Only `UserRepository.toEntity()` knows about `_id`, `__v`, or Mongoose-specific fields.

### Use `.lean()` on All Read Operations
```typescript
this.model.find(filter).lean().exec()
```
`.lean()` skips creating full Mongoose Document instances (with prototype methods, change tracking, etc.) and returns plain JS objects. Read operations are ~2-3x faster and use less memory.

**Exception:** Do not use `.lean()` on `create` — you need the Document instance to call `.save()`.

### `{ new: true }` on Updates
```typescript
this.model.findByIdAndUpdate(id, data, { new: true })
```
Returns the document **after** the update. Without this, you'd need a second query to get the updated state.

### `model.exists()` for Existence Checks
```typescript
await this.model.exists({ email })
```
More efficient than `findOne()` — uses a `{ _id: 1 }` projection internally and short-circuits after the first match. Use this when you only care about "does it exist", not "what is it".

---

## 4. Dependency Injection

### `UserDocument.name` Over String Literals
```typescript
// Good
@InjectModel(UserDocument.name)

// Bad
@InjectModel('UserDocument')
```
Using `UserDocument.name` (the TypeScript class property) avoids typos and automatically updates if you rename the class. String literals are a maintenance risk.

### `MongooseModule.forFeature` — Keep Schemas Scoped
Each feature module registers only its own schemas:
```typescript
// user.module.ts
MongooseModule.forFeature([{ name: UserDocument.name, schema: UserSchema }])
```
Never register all schemas in `DatabaseModule` or `AppModule`. Scoping prevents accidental cross-module model injection and makes each module self-contained.

---

## 5. Config and Secrets

### Validate Env Vars at Startup
```typescript
ConfigModule.forRoot({
  validationSchema: envValidationSchema,
  validationOptions: { abortEarly: false }
})
```
Fail fast with a clear error message rather than silently connecting to the wrong database or crashing mid-runtime.

### Never Commit `.env`
```
# .gitignore
.env
```
Always commit `.env.example` with placeholder values so teammates know what is required.

---

## 6. Architecture Conventions

### Separation: Entity vs Schema
| File | Contains | Mongoose Dependency |
|---|---|---|
| `user.entity.ts` | Domain model — used in services, DTOs, tests | None |
| `user.schema.ts` | MongoDB document shape | Yes — extends `Document` |

Services and controllers work with `User` entities. Only the repository layer touches `UserDocument`.

### Module Structure Per Feature
```
src/modules/<feature>/
├── schemas/          ← Mongoose schema + document type
├── entities/         ← Domain entity (plain class)
├── repositories/     ← Data access (extends BaseRepository)
├── dto/              ← Request/response shapes
├── interface/        ← Service interfaces
├── <feature>.module.ts
├── <feature>.service.ts
└── <feature>.controller.ts
```
Every new feature module should follow this same structure.

---

## 7. When Adding a New Module (Checklist)

- [ ] Create `schemas/<name>.schema.ts` with `@Schema({ timestamps: true, collection: '...' })`
- [ ] Add `@Prop({ index: true })` on any field used in queries
- [ ] Create `repositories/<name>.repository.ts` extending `BaseRepository<YourDocument>`
- [ ] Inject model with `@InjectModel(YourDocument.name)`
- [ ] Add `toEntity()` method mapping `_id` → `id`
- [ ] Register schema in `<feature>.module.ts` with `MongooseModule.forFeature(...)`
- [ ] Add repository to `providers` in `<feature>.module.ts`
- [ ] Add repository to `exports` in `<feature>.module.ts` if other modules need it
- [ ] Update service to inject and use the repository

---

## 8. Useful `mongosh` Commands for Development

```js
// Switch to your database
use nest-playground

// List all collections
show collections

// Count documents in a collection
db.users.countDocuments()

// Find all documents (pretty-printed)
db.users.find().pretty()

// Find by field
db.users.find({ isActive: true })

// Find one by _id
db.users.findOne({ _id: ObjectId("your-id-here") })

// Check indexes on a collection
db.users.getIndexes()

// Drop a collection (destructive — dev only)
db.users.drop()

// Delete all documents but keep the collection
db.users.deleteMany({})

// Explain a query (check if index is used)
db.users.find({ email: 'test@example.com' }).explain('executionStats')
```

---

## Implementation Complete

All phases are done. Your NestJS project now has:

- MongoDB running locally and auto-starting on boot
- Mongoose connected via `DatabaseModule` with proper timeouts and pooling
- Environment config validated at startup with Joi
- A clean schema/entity separation
- A reusable `BaseRepository<T>` for all future collections
- A `UserRepository` backed by real MongoDB data
- Best-practice indexes, timestamps, and query patterns throughout
