# Data Model: News Article Comments

**Branch**: `001-news-comments` | **Phase**: 1 | **Date**: 2026-03-24

## Domain Entity: Comment

**Location**: `src/core/domain/comment/entities/comment.domain.ts`

### Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | `string` (UUID v7) | No | Unique identifier |
| `content` | `string` (max 2000 chars) | No | Comment text |
| `author` | `User` (domain) | No | The user who wrote the comment |
| `newsId` | `string` | No | ID of the news article this comment belongs to |
| `createdAt` | `Date` | No | Timestamp when posted |
| `updatedAt` | `Date` | No | Timestamp of last change |
| `editedAt` | `Date` | Yes | Set when content is updated; `undefined` if never edited |

### Invariants

- `content` MUST NOT be empty (length ≥ 1 after trim).
- `content` MUST NOT exceed 2000 characters.
- Only the comment's `author` or an ADMIN user may delete a comment.
- Only the comment's `author` may edit a comment.

### Factories

- `Comment.create(props)` — creates a new unsaved comment; sets `id` via `uuidv7()`, `createdAt`, `updatedAt` to now, `editedAt` to `undefined`.
- `Comment.reconstitute(props)` — rebuilds a comment from persisted data.

### Business Methods

- `updateContent(newContent: string): void` — validates and replaces `content`; sets `editedAt` and `updatedAt` to now.

---

## Repository Interface: ICommentRepository

**Location**: `src/core/domain/comment/repositories/comment.repository.interface.ts`

```
findAllByNewsId(newsId: string): Promise<Comment[]>      // ordered by createdAt ASC
countByNewsId(newsId: string): Promise<number>
findById(id: string): Promise<Comment | null>
save(comment: Comment): Promise<Comment>
update(comment: Comment): Promise<Comment>
delete(id: string): Promise<void>
```

---

## ORM Entity: CommentOrmEntity

**Location**: `src/infrastructure/database/typeorm/entities/comment.orm-entity.ts`

### Table: `comments`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, `@PrimaryGeneratedColumn('uuid')` |
| `content` | TEXT | NOT NULL |
| `author_id` | UUID FK → `users.id` | NOT NULL |
| `news_id` | UUID FK → `news.id` | NOT NULL, ON DELETE CASCADE |
| `created_at` | TIMESTAMP | NOT NULL, auto |
| `updated_at` | TIMESTAMP | NOT NULL, auto |
| `edited_at` | TIMESTAMP | NULLABLE |

**Relations**:
- `ManyToOne` → `UserOrmEntity` (author), eager: false
- `ManyToOne` → `NewsOrmEntity` (news), eager: false

---

## Migration

**File**: `src/infrastructure/database/typeorm/migrations/<timestamp>-AddCommentsBoundedContext.ts`

Creates (or replaces) the `comments` table with the full schema above. If the table exists from `InitSchema`, the migration adds the `updated_at` and `edited_at` columns and alters `id` to UUID type.

---

## Entity Relationships

```
User (1) ──────────────── (many) Comment
News (1) ──────────────── (many) Comment   [CASCADE DELETE]
```

---

## NewsResponseDto — commentCount addition

`GetAllNewsUseCase` and `GetNewsByIdUseCase` will call `ICommentRepository.countByNewsId()` and include the result in `NewsResponseDto.commentCount: number`.
