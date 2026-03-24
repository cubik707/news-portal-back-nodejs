# Implementation Plan: News Article Comments

**Branch**: `001-news-comments` | **Date**: 2026-03-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-news-comments/spec.md`

## Summary

Add a flat comments system to news articles. Approved users can post, edit, and delete their own comments. Admins can delete any comment. Comments are publicly readable. Implemented as a new `comment` bounded context following the existing Clean Architecture pattern.

## Technical Context

**Language/Version**: TypeScript 5, Node.js 18+
**Primary Dependencies**: NestJS 11, TypeORM 0.3, class-validator, uuidv7
**Storage**: PostgreSQL — new `comments` table
**Testing**: Jest (unit), Supertest (E2E integration)
**Target Platform**: Linux server (same as existing backend)
**Project Type**: REST web service (NestJS)
**Performance Goals**: Standard web API — comments load inline with news
**Constraints**: No pagination required (YAGNI); max 2000 chars enforced at DTO level
**Scale/Scope**: Internal IT portal — low concurrent usage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clean Architecture — no logic in controllers | ✅ PASS | All logic in use cases; controller delegates only |
| I. Clean Architecture — domain has no framework imports | ✅ PASS | `comment.domain.ts` uses only `uuidv7` |
| II. DDD — own bounded context | ✅ PASS | `comment` context mirrors `news`, `user`, etc. |
| II. DDD — one use case per operation | ✅ PASS | 4 use cases: Get, Create, Update, Delete |
| III. SOLID — single responsibility | ✅ PASS | Each use case has one `execute()` |
| IV. YAGNI — no speculative features | ✅ PASS | No pagination, no threading, no reactions |
| IV. DRY — no duplicate logic | ✅ PASS | Ownership check lives only in use case |
| V. Testing — integration-first | ✅ PASS | E2E Supertest tests planned; unit tests for entity invariants only |
| Security — protected endpoints have guards | ✅ PASS | POST/PUT/DELETE use `JwtAuthGuard` + `ApprovedGuard` |
| Observability — logging via Pino | ✅ PASS | Global HTTP middleware handles it; no manual duplication |

**Result: ALL GATES PASS — proceed to implementation.**

## Project Structure

### Documentation (this feature)

```
specs/001-news-comments/
├── plan.md              ← this file
├── research.md          ← Phase 0
├── data-model.md        ← Phase 1
├── contracts/
│   └── comments-api.md  ← Phase 1
└── tasks.md             ← Phase 2 (/speckit.tasks)
```

### Source Code

```
src/
├── core/domain/
│   └── comment/
│       ├── entities/
│       │   └── comment.domain.ts
│       ├── repositories/
│       │   └── comment.repository.interface.ts
│       └── exceptions/
│           ├── comment-not-found.exception.ts
│           └── comment-access-denied.exception.ts
│
├── application/
│   └── comment/
│       ├── dtos/
│       │   ├── comment-create.dto.ts
│       │   ├── comment-update.dto.ts
│       │   └── comment-response.dto.ts
│       └── use-cases/
│           ├── get-comments-by-news.use-case.ts
│           ├── create-comment.use-case.ts
│           ├── update-comment.use-case.ts
│           └── delete-comment.use-case.ts
│
├── infrastructure/database/typeorm/
│   ├── entities/
│   │   └── comment.orm-entity.ts
│   ├── repositories/
│   │   └── comment.typeorm-repository.ts
│   ├── mappers/
│   │   └── comment.mapper.ts
│   └── migrations/
│       └── <timestamp>-AddCommentsBoundedContext.ts
│
└── presentation/
    └── comments/
        ├── comments.controller.ts
        └── comments.module.ts

test/
└── comments.e2e-spec.ts
```

**Structure Decision**: Web application — single backend repo. Follows Option 1 (single project) as all existing feature modules do. The `comment` context gets its own folder at every layer, identical to `news`, `category`, `tag`, etc.

---

## Implementation Steps

### Step 1 — Domain layer

**File**: `src/core/domain/comment/entities/comment.domain.ts`

- `CommentProps` and `CreateCommentProps` interfaces
- `Comment` class with private constructor
- `Comment.create()` factory: generates `uuidv7()` ID, sets `createdAt` / `updatedAt` to now, `editedAt` to `undefined`
- `Comment.reconstitute()` factory: restores from persistence
- Getters for all fields
- `updateContent(newContent: string)`: validates length (1–2000), sets `editedAt` and `updatedAt`

**File**: `src/core/domain/comment/repositories/comment.repository.interface.ts`

```ts
export interface ICommentRepository {
  findAllByNewsId(newsId: string): Promise<Comment[]>;
  countByNewsId(newsId: string): Promise<number>;
  findById(id: string): Promise<Comment | null>;
  save(comment: Comment): Promise<Comment>;
  update(comment: Comment): Promise<Comment>;
  delete(id: string): Promise<void>;
}
export const COMMENT_REPOSITORY = Symbol('COMMENT_REPOSITORY');
```

**Files**: `comment-not-found.exception.ts`, `comment-access-denied.exception.ts`
- Extend `NotFoundException` / `ForbiddenException` respectively (mirror existing exception pattern)

---

### Step 2 — Application layer

**DTOs**:

`comment-create.dto.ts`
- `content: string` — `@IsString()`, `@MinLength(1)`, `@MaxLength(2000)`

`comment-update.dto.ts`
- Same as create DTO (same validation)

`comment-response.dto.ts`
- `id`, `content`, `author` (id, username, firstName, lastName), `newsId`, `createdAt`, `editedAt`
- Static `fromDomain(comment: Comment): CommentResponseDto`

**Use cases**:

`get-comments-by-news.use-case.ts`
- Injects `INewsRepository` (verify news exists), `ICommentRepository`
- Returns `Comment[]` ordered by `createdAt ASC`

`create-comment.use-case.ts`
- Injects `INewsRepository` (verify news exists), `IUserRepository`, `ICommentRepository`
- Calls `Comment.create(...)`, persists, returns saved comment

`update-comment.use-case.ts`
- Injects `ICommentRepository`
- Loads comment by ID → throws `CommentNotFoundException` if missing
- Checks `comment.author.id === command.requestingUserId` → throws `CommentAccessDeniedException` if not owner
- Calls `comment.updateContent(newContent)`, persists, returns updated comment

`delete-comment.use-case.ts`
- Injects `ICommentRepository`
- Loads comment by ID → throws `CommentNotFoundException` if missing
- Checks `comment.author.id === command.requestingUserId || command.isAdmin` → throws `CommentAccessDeniedException` if neither
- Deletes

---

### Step 3 — Infrastructure layer

**`comment.orm-entity.ts`**
- `@Entity('comments')`
- `@PrimaryGeneratedColumn('uuid') id`
- `@Column({ type: 'text' }) content`
- `@ManyToOne(() => UserOrmEntity) author`
- `@ManyToOne(() => NewsOrmEntity, { onDelete: 'CASCADE' }) news` + `@Column() newsId`
- `@CreateDateColumn() createdAt`
- `@UpdateDateColumn() updatedAt`
- `@Column({ type: 'timestamp', nullable: true }) editedAt`

**`comment.mapper.ts`**
- `toDomain(orm: CommentOrmEntity): Comment` — calls `Comment.reconstitute()`
- Maps `UserOrmEntity` author to `User` domain (reuse `UserMapper.toDomain`)

**`comment.typeorm-repository.ts`**
- Implements `ICommentRepository`
- `findAllByNewsId`: `find({ where: { news: { id: newsId } }, order: { createdAt: 'ASC' }, relations: ['author', 'author.userInfo'] })`
- `countByNewsId`: `count({ where: { news: { id: newsId } } })`
- `findById`: `findOne` with author relations
- `save` / `update` / `delete`: standard TypeORM operations

**Migration** `<timestamp>-AddCommentsBoundedContext.ts`
```sql
-- up
CREATE TABLE IF NOT EXISTS "comments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "content" TEXT NOT NULL,
  "author_id" UUID NOT NULL REFERENCES "users"("id"),
  "news_id" UUID NOT NULL REFERENCES "news"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "edited_at" TIMESTAMP
);
-- If table already exists from InitSchema (SERIAL version), add missing columns:
ALTER TABLE "comments"
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS "edited_at" TIMESTAMP;
-- down
DROP TABLE IF EXISTS "comments";
```

---

### Step 4 — Presentation layer

**`comments.controller.ts`**

| Method | Route | Guards | Use Case |
|--------|-------|--------|----------|
| `GET` | `/news/:newsId/comments` | none (public) | `GetCommentsByNewsUseCase` |
| `POST` | `/news/:newsId/comments` | `ApprovedGuard` | `CreateCommentUseCase` |
| `PUT` | `/comments/:id` | `ApprovedGuard` | `UpdateCommentUseCase` |
| `DELETE` | `/comments/:id` | `ApprovedGuard` | `DeleteCommentUseCase` |

- All responses wrapped in `SuccessResponseDto`
- `@Public()` decorator on `GET` (existing pattern for bypassing `JwtAuthGuard`)
- `@CurrentUser()` for extracting `requestingUserId` and `isAdmin` in protected routes

**`comments.module.ts`**
- Declares `CommentsController`
- Provides all 4 use cases
- Provides `{ provide: COMMENT_REPOSITORY, useClass: CommentTypeormRepository }`
- Imports: `TypeOrmModule.forFeature([CommentOrmEntity, NewsOrmEntity, UserOrmEntity])`, `NewsModule` (for `INewsRepository` token), `UsersModule` (for `IUserRepository` token)
- Register in `AppModule`

---

### Step 5 — `NewsResponseDto` comment count

Add `commentCount: number` to `NewsResponseDto`.

In `GetAllNewsUseCase` and `GetNewsByIdUseCase`:
- Inject `ICommentRepository`
- Call `countByNewsId(news.id)` per article
- Pass count into `NewsResponseDto.fromDomain(news, commentCount)`

---

### Step 6 — Integration tests

**`test/comments.e2e-spec.ts`**

Scenarios to cover (Supertest against real DB):
1. `GET /news/:newsId/comments` — returns empty array when no comments
2. `POST /news/:newsId/comments` — approved user creates comment → 201
3. `POST /news/:newsId/comments` — unauthenticated → 401
4. `POST /news/:newsId/comments` — unapproved user → 403
5. `POST /news/:newsId/comments` — empty content → 400
6. `POST /news/:newsId/comments` — content > 2000 chars → 400
7. `PUT /comments/:id` — author edits own comment → 200, `editedAt` is set
8. `PUT /comments/:id` — non-author attempts edit → 403
9. `DELETE /comments/:id` — author deletes own comment → 200
10. `DELETE /comments/:id` — admin deletes another user's comment → 200
11. `DELETE /comments/:id` — non-owner non-admin → 403
12. `GET /news/:newsId` — `commentCount` field present and accurate

---

## Complexity Tracking

No constitution violations. No complexity justification required.
