# Domain Entity Layer Refactoring — Code Review

## 1. Props pattern — `private constructor(private readonly props: UserProps) {}`

### Pros
- Eliminates ~15 lines of boilerplate assignments in the constructor
- Adding a new field only requires modifying the interface — no separate private field + getter needed
- `UserProps` serves as a "state snapshot" — convenient in tests: the full shape of the object is immediately visible

### Cons — and this is the key issue

`readonly` here applies to the **reference**, not to the object's properties. This means:

```typescript
// Won't compile:
this.props = { ...newProps };       // ✅ correctly blocked

// Compiles without errors:
this.props.id = 'hacked';           // ⚠️ allowed!
this.props.createdAt = new Date();  // ⚠️ allowed!
```

In the **old** version, `private readonly _id` was truly readonly — even inside the class, `this._id = x` was a compile error. Now `id` is not protected from accidental internal mutation in any way.

To protect specific fields, they must be explicitly marked in the interface:

```typescript
export interface UserProps {
  readonly id: string;
  readonly createdAt: Date;
  username: string;   // mutable — fine
  // ...
}
```

---

## 2. UUID instead of number

### Pros
- The entity is fully valid before hitting the DB — no infrastructure dependency
- UUIDs can be generated on any node (microservices, offline scenarios)
- Eliminates "infrastructure leak" into the domain

### Cons
- **B-tree index performance**: UUID v4 is random — inserts are scattered across the entire index, causing page splits. `SERIAL` always appends to the end — the index never fragments. On tables with millions of rows this is noticeable
- **Size**: UUID — 16 bytes (or 36 chars in text form), integer — 4 bytes. Every FK, junction table, and index becomes 4× larger
- **Readability**: `/api/news/3` → `/api/news/f47ac10b-58cc-4372-a567-0e02b2c3d479`
- **`gen_random_uuid()`** is natively available only from PostgreSQL 13+. On older versions the `pgcrypto` extension is required. The migration does not check for this
- `ORDER BY id` no longer works as a proxy for creation order — explicit `ORDER BY created_at` is required everywhere

---

## 3. Class rename: `UserDomain` → `User`

### Pros
- DDD standard: context is already clear from the folder structure
- Cleaner in type signatures and function parameters

### Cons
- `User`, `News`, `Category`, `Tag` are extremely generic names. In a NestJS project, import collisions are easy to encounter:
  ```typescript
  // In a controller or guard:
  import { User } from '@core/domain/user/entities/user.domain';
  import { User } from 'some-auth-library'; // collision
  ```
- `UserDomain` vs `UserOrmEntity` — the distinction is obvious. `User` vs `UserOrmEntity` — less so, especially for a developer new to the codebase
- The `Domain` suffix was cheap insurance against collisions that was discarded

---

## 4. Defensive Date copies

```typescript
get createdAt(): Date {
  return new Date(this.props.createdAt.getTime());
}
```

### Pros
- `user.createdAt.setFullYear(1990)` no longer corrupts internal state
- Correct protection against side effects from external mutation

### Cons
- **Allocation overhead on every getter call**: `new Date(...)` allocates memory. When serializing 500 news items in a list with 4 Date fields each — 2000 extra allocations per request
- In practice, someone mutating a returned `Date` intentionally is extremely rare. The problem is theoretical; the cost is real
- Cleaner alternatives: mark dates `readonly` in the interface + documentation, or return `number` (timestamp) instead of `Date` — then there is no mutation problem at all

---

## 5. Exporting `UserProps`

### Pros
- Required for `reconstitute()` in mappers and for constructing test fixtures

### Cons
- Fully exposes the entity's internal state. Any external code now knows the complete structure of `User` through the interface — this breaks encapsulation at the type level

---

## 6. Migration — the most dangerous change

```typescript
// UuidIds1000000000001
await queryRunner.query(`DROP TABLE IF EXISTS "news_approval"`);
// ... all other tables
```

### Pros
- Simple and easy to understand

### Cons
- **All data is deleted**. For a dev environment — acceptable. But this same file lives in the repository and will be applied to staging/production if someone is not paying attention
- No data migration — if `users` already has rows they are silently gone
- `down()` in the new migration only drops tables but does not restore the old ones with `SERIAL` — rollback is actually incomplete

---

## Summary

| Change | Architectural gain | Practical cost |
|---|---|---|
| Props pattern | Less code, easier to extend | `readonly` does not protect properties; `id` became mutable |
| UUID | Domain independent of DB | Index fragmentation, larger size, requires pg13+ |
| Class rename | Cleaner per DDD | Risk of import collisions |
| Date copies | Correct mutation protection | Allocation on every getter call |
| Migration | Consistent schema | Destructive, no data migration, incomplete rollback |

**Bottom line**: the changes move in the right architectural direction, but `readonly props` creates a false sense of safety — for fields that are supposed to be truly immutable (`id`, `createdAt`) this is actually worse than before. They must be marked `readonly` directly in `UserProps`.
