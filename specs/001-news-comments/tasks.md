# Tasks: News Article Comments

**Input**: Design documents from `specs/001-news-comments/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: Maps to user story from spec.md (US1–US5)

---

## Phase 1: Setup

**Purpose**: Create the folder skeleton for the new `comment` bounded context

- [X] T001 Create directory structure: `src/core/domain/comment/entities/`, `src/core/domain/comment/repositories/`, `src/core/domain/comment/exceptions/`, `src/application/comment/use-cases/`, `src/application/comment/dtos/`, `src/presentation/comments/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain model, infrastructure, and module wiring — MUST be complete before any user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Create `Comment` domain entity with `create()` / `reconstitute()` factories, `updateContent()` business method, and `editedAt` field in `src/core/domain/comment/entities/comment.domain.ts`
- [X] T003 [P] Create `ICommentRepository` interface (`findAllByNewsId`, `countByNewsId`, `findById`, `save`, `update`, `delete`) and `COMMENT_REPOSITORY` symbol in `src/core/domain/comment/repositories/comment.repository.interface.ts`
- [X] T004 [P] Create `CommentNotFoundException` extending `NotFoundException` in `src/core/domain/comment/exceptions/comment-not-found.exception.ts`
- [X] T005 [P] Create `CommentAccessDeniedException` extending `ForbiddenException` in `src/core/domain/comment/exceptions/comment-access-denied.exception.ts`
- [X] T006 Create `CommentOrmEntity` with `@Entity('comments')`, UUID PK, `content` TEXT, `ManyToOne` to `UserOrmEntity` and `NewsOrmEntity` (CASCADE), `createdAt`, `updatedAt`, nullable `editedAt` in `src/infrastructure/database/typeorm/entities/comment.orm-entity.ts`
- [X] T007 Create `CommentMapper.toDomain(orm): Comment` using `Comment.reconstitute()` in `src/infrastructure/database/typeorm/mappers/comment.mapper.ts`
- [X] T008 Create `CommentTypeormRepository` implementing `ICommentRepository` (all 6 methods) in `src/infrastructure/database/typeorm/repositories/comment.typeorm-repository.ts`
- [X] T009 Generate migration `AddCommentsBoundedContext` creating `comments` table (UUID PK, `content` TEXT NOT NULL, `author_id` UUID FK→users, `news_id` UUID FK→news CASCADE DELETE, `created_at`, `updated_at`, `edited_at` NULLABLE) in `src/infrastructure/database/typeorm/migrations/<timestamp>-AddCommentsBoundedContext.ts`
- [X] T010 Create `CommentsModule` wiring `COMMENT_REPOSITORY` → `CommentTypeormRepository`, importing `TypeOrmModule.forFeature([CommentOrmEntity, NewsOrmEntity, UserOrmEntity])` in `src/presentation/comments/comments.module.ts`
- [X] T011 Register `CommentsModule` in `src/app.module.ts`

**Checkpoint**: Run `npm run migration:run` — `comments` table created. App boots without errors.

---

## Phase 3: User Story 1 — Read Comments (Priority: P1) 🎯 MVP

**Goal**: Any visitor can open a news article and see all comments in chronological order with author name and timestamp.

**Independent Test**: `GET /news/:newsId/comments` with a valid approved-user token returns `[]` on an article with no comments, and returns the correct list after seeding comments. Same call without a token returns 401.

- [X] T012 [US1] Create `CommentResponseDto` with `fromDomain()` static factory (fields: `id`, `content`, `author` {id, username, firstName, lastName}, `newsId`, `createdAt`, `editedAt`) in `src/application/comment/dtos/comment-response.dto.ts`
- [X] T013 [US1] Create `GetCommentsByNewsUseCase` injecting `INewsRepository` (verify news exists → 404) and `ICommentRepository` (`findAllByNewsId`) in `src/application/comment/use-cases/get-comments-by-news.use-case.ts`
- [X] T014 [US1] Add `GET /news/:newsId/comments` endpoint (`@UseGuards(ApprovedGuard)`, uses `GetCommentsByNewsUseCase`, returns `SuccessResponseDto<CommentResponseDto[]>`) and inject use case in `CommentsModule` in `src/presentation/comments/comments.controller.ts`
- [X] T015 [US1] Write E2E integration tests for `GET /news/:newsId/comments`: 200 with empty list, 200 with populated list (oldest-first order), 401 without token, 403 unapproved user, 404 unknown newsId in `test/comments.e2e-spec.ts`

**Checkpoint**: `GET /news/:newsId/comments` returns comments without auth. E2E tests pass.

---

## Phase 4: User Story 2 — Post a Comment (Priority: P2)

**Goal**: A registered, approved user can submit a comment on a news article and see it appear immediately.

**Independent Test**: `POST /news/:newsId/comments` with a valid JWT for an approved user returns 201 with the new comment; same call without a token returns 401.

- [X] T016 [P] [US2] Create `CommentCreateDto` with `@IsString() @MinLength(1) @MaxLength(2000) content` in `src/application/comment/dtos/comment-create.dto.ts`
- [X] T017 [US2] Create `CreateCommentUseCase` injecting `INewsRepository` (verify news exists → 404), `IUserRepository` (load author), `ICommentRepository` (`save`) in `src/application/comment/use-cases/create-comment.use-case.ts`
- [X] T018 [US2] Add `POST /news/:newsId/comments` endpoint (`@UseGuards(ApprovedGuard)`, `@CurrentUser()`, delegates to `CreateCommentUseCase`, returns 201) and register use case in `CommentsModule` in `src/presentation/comments/comments.controller.ts`
- [X] T019 [US2] Add E2E tests for `POST`: 201 approved user, 400 empty content, 400 content > 2000 chars, 403 unapproved user, 404 unknown newsId in `test/comments.e2e-spec.ts`

**Checkpoint**: Approved users can post comments. Validation and auth guards work. E2E tests pass.

---

## Phase 5: User Story 3 — Edit Own Comment (Priority: P3)

**Goal**: A comment author can edit their comment text; the updated comment displays an `editedAt` timestamp.

**Independent Test**: `PUT /comments/:id` by the comment's author returns 200 with updated `content` and non-null `editedAt`; same call by a different user returns 403.

- [X] T020 [P] [US3] Create `CommentUpdateDto` with same validation as `CommentCreateDto` in `src/application/comment/dtos/comment-update.dto.ts`
- [X] T021 [US3] Create `UpdateCommentUseCase` injecting `ICommentRepository`: load by id → 404, check ownership → 403 (`CommentAccessDeniedException`), call `comment.updateContent()`, persist in `src/application/comment/use-cases/update-comment.use-case.ts`
- [X] T022 [US3] Add `PUT /comments/:id` endpoint (`@UseGuards(ApprovedGuard)`, `@CurrentUser()`, delegates to `UpdateCommentUseCase`) and register use case in `CommentsModule` in `src/presentation/comments/comments.controller.ts`
- [X] T023 [US3] Add E2E tests for `PUT`: 200 author edits own comment (`editedAt` is set), 400 empty content, 403 non-author, 404 unknown id in `test/comments.e2e-spec.ts`

**Checkpoint**: Authors can edit their comments. `editedAt` is set and returned. Non-authors get 403.

---

## Phase 6: User Stories 4 & 5 — Delete Comment (Priority: P4/P5)

**Goal**: A comment author can delete their own comment (US4). An admin can delete any comment regardless of author (US5). Both use the same endpoint.

**Independent Test**: `DELETE /comments/:id` by author → 200 and comment gone; by admin on another user's comment → 200; by non-owner non-admin → 403.

- [X] T024 [US4] Create `DeleteCommentUseCase` injecting `ICommentRepository`: load by id → 404, check `authorId === requestingUserId || isAdmin` → 403 if neither, call `delete()` in `src/application/comment/use-cases/delete-comment.use-case.ts`
- [X] T025 [US4] Add `DELETE /comments/:id` endpoint (`@UseGuards(ApprovedGuard)`, `@CurrentUser()`, passes `isAdmin` flag from JWT payload to use case, returns `SuccessResponseDto<null>`) and register use case in `CommentsModule` in `src/presentation/comments/comments.controller.ts`
- [X] T026 [US4] Add E2E tests for `DELETE` — author deletes own comment → 200, comment count decreases; 403 non-owner non-admin; 404 unknown id in `test/comments.e2e-spec.ts`
- [X] T027 [US5] Add E2E test for admin deleting another user's comment → 200 in `test/comments.e2e-spec.ts`

**Checkpoint**: Authors and admins can delete comments. All other users get 403. E2E tests pass.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: `commentCount` on news responses and documentation

- [X] T028 Add `commentCount: number` field to `NewsResponseDto.fromDomain()` signature in `src/application/news/dtos/news-response.dto.ts`
- [X] T029 Inject `ICommentRepository` into `GetAllNewsUseCase`, call `countByNewsId()` per article, pass count into `NewsResponseDto.fromDomain()` in `src/application/news/use-cases/get-all-news.use-case.ts`
- [X] T030 Inject `ICommentRepository` into `GetNewsByIdUseCase`, call `countByNewsId()`, pass count into `NewsResponseDto.fromDomain()` in `src/application/news/use-cases/get-news-by-id.use-case.ts`
- [X] T031 Add E2E assertion: `GET /news/:newsId` response includes `commentCount` field that reflects the current comment count in `test/comments.e2e-spec.ts`
- [X] T032 Update `README.md` with Comments API endpoints table and any new env/migration notes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phases 3–6 (User Stories)**: All depend on Phase 2 completion; stories are sequential (each adds a new endpoint)
- **Phase 7 (Polish)**: Depends on Phases 3–6 complete

### Within Each User Story Phase

- DTOs before use cases
- Use cases before controller endpoints
- Controller endpoint before E2E test

### Parallel Opportunities

Within Phase 2, tasks T003/T004/T005 can run in parallel (different files, no dependencies between them). T006 (ORM entity) can start in parallel with T002 (domain entity) since they're separate files.

Within Phase 4, T016 (DTO) can run in parallel with other Phase 4 prep.

---

## Parallel Example: Phase 2 (Foundational)

```
Start simultaneously:
  T002  comment.domain.ts
  T003  comment.repository.interface.ts
  T004  comment-not-found.exception.ts
  T005  comment-access-denied.exception.ts

Then (after T002, T003 complete):
  T006  comment.orm-entity.ts
  T007  comment.mapper.ts  (after T006)
  T008  comment.typeorm-repository.ts  (after T007)
  T009  migration  (after T006)
  T010  comments.module.ts  (after T008)
  T011  app.module.ts  (after T010)
```

---

## Implementation Strategy

### MVP (User Story 1 only — read comments)

1. Phase 1 + Phase 2 (foundational)
2. Phase 3 (read endpoint, no auth required)
3. **Validate**: `GET /news/:id/comments` works — ship MVP

### Full Incremental Delivery

1. Foundation → read comments (MVP)
2. Add post comment → registered users can participate
3. Add edit comment → authors can correct mistakes
4. Add delete comment → full ownership + moderation
5. Add commentCount to news responses → polish

---

## Notes

- `[P]` = different files, safe to implement in parallel
- Commit after each phase checkpoint
- Run `npm run test:e2e` after each user story phase to validate independently
- Migration must run (`npm run migration:run`) before any E2E test that touches the DB
- US4 and US5 share one use case and one endpoint — the `isAdmin` flag in the JWT payload drives the authorization branch
