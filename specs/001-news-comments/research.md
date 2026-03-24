# Research: News Article Comments

**Branch**: `001-news-comments` | **Phase**: 0 | **Date**: 2026-03-24

## Decisions

### 1. Comment bounded context placement

**Decision**: `comment` becomes its own bounded context under `src/core/domain/comment/`, mirroring the existing `news`, `user`, `category` structure.

**Rationale**: Comments have their own identity, lifecycle, and invariants (ownership, edit rules). Folding them into the `news` context would violate Single Responsibility and make the News entity responsible for enforcing comment rules.

**Alternatives considered**:
- Embed comments in the News aggregate — rejected: would bloat the News entity and couple unrelated lifecycles.

---

### 2. Comment ID strategy

**Decision**: Use `uuidv7()` for Comment IDs, consistent with the existing domain entities (News uses `uuidv7()`).

**Rationale**: All existing domain entities use `uuidv7`. The existing `InitSchema` migration uses SERIAL integers, but the live ORM entities use `@PrimaryGeneratedColumn('uuid')` — the ORM definition is authoritative.

**Alternatives considered**:
- SERIAL integer — rejected: inconsistent with the domain layer pattern already established.

---

### 3. Edit tracking

**Decision**: Add a nullable `editedAt: Date | undefined` field to the Comment entity. Set it on `updateContent()`. The ORM entity maps this to a nullable `edited_at` TIMESTAMP column.

**Rationale**: The spec requires a visible "edited" indicator (FR-006). `editedAt` is the simplest way to derive that indicator without a separate audit table.

**Alternatives considered**:
- Boolean `isEdited` flag — rejected: loses the timestamp, which is useful for display.
- Full audit log table — rejected: YAGNI; no requirement for edit history.

---

### 4. Existing `comments` table in InitSchema migration

**Decision**: The `InitSchema` migration already declares a `comments` table (with `id SERIAL`, `news_id`, `user_id`, `content`, `created_at`). Since the ORM entities use UUID and the new Comment entity requires `edited_at` and `updated_at`, generate a **new migration** (`AddCommentsBoundedContext`) that drops the legacy definition (if it exists) and creates the correct schema, or adds missing columns if the table was never deployed.

**Rationale**: The safest path is a standalone migration scoped to this feature that owns the final `comments` schema.

---

### 5. Access control for delete

**Decision**: Use the existing `RolesGuard` + `@Roles(UserRole.ADMIN)` pattern combined with ownership check inside the use case (compare `comment.author.id === requestingUserId`). Non-owners without ADMIN role receive a `ForbiddenException`.

**Rationale**: Mirrors the pattern used for news deletion (EDITOR owns, ADMIN overrides). No new guard is needed.

---

### 6. Comment count on news response

**Decision**: Add a virtual `commentCount` field to `NewsResponseDto`, populated by a `countByNewsId(newsId)` call on `ICommentRepository` inside `GetNewsByIdUseCase` (and `GetAllNewsUseCase`).

**Rationale**: Spec FR-011 requires displaying comment count per article. A count query is far cheaper than loading all comments into every news response.

**Alternatives considered**:
- Denormalized counter column on `news` — rejected: YAGNI, overkill for a pet project.
- Always load full comment list — rejected: N+1 problem on list endpoints.

---

### 7. Testing strategy

**Decision**: Write E2E integration tests (Supertest) covering: post comment, get comments, edit comment, delete own comment, admin delete any comment, permission denial scenarios.

**Rationale**: Per constitution Principle V — integration tests are the primary safety net. The comment domain logic (ownership check, content validation) is straightforward enough not to need separate unit tests.
