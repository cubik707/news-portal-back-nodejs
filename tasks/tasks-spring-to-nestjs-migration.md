## Relevant Files

### Core / Domain
- `src/core/shared/enums/user-role.enum.ts` - `UserRole` enum (ADMIN, EDITOR, USER)
- `src/core/shared/enums/news-status.enum.ts` - `NewsStatus` enum (draft, published, archived)
- `src/core/shared/enums/approval-status.enum.ts` - `ApprovalStatus` enum (pending, approved, rejected)
- `src/core/shared/exceptions/business.exception.ts` - Base `BusinessException` class
- `src/core/domain/user/entities/user.domain.ts` - Pure TS `UserDomain` class
- `src/core/domain/user/repositories/user.repository.interface.ts` - `IUserRepository` interface + `USER_REPOSITORY` symbol
- `src/core/domain/user/exceptions/user-not-found.exception.ts`
- `src/core/domain/user/exceptions/user-already-exists.exception.ts`
- `src/core/domain/user/exceptions/user-not-approved.exception.ts`
- `src/core/domain/news/entities/news.domain.ts` - Pure TS `NewsDomain` class
- `src/core/domain/news/repositories/news.repository.interface.ts`
- `src/core/domain/news/exceptions/news-not-found.exception.ts`
- `src/core/domain/category/repositories/category.repository.interface.ts`
- `src/core/domain/category/exceptions/category-not-found.exception.ts`
- `src/core/domain/tag/repositories/tag.repository.interface.ts`
- `src/core/domain/tag/exceptions/tag-not-found.exception.ts`

### Infrastructure
- `src/infrastructure/database/database.module.ts` - TypeORM async module setup
- `src/infrastructure/database/data-source.ts` - TypeORM DataSource for CLI migrations
- `src/infrastructure/database/typeorm/entities/user.orm-entity.ts`
- `src/infrastructure/database/typeorm/entities/news.orm-entity.ts`
- `src/infrastructure/database/typeorm/entities/role.orm-entity.ts`
- `src/infrastructure/database/typeorm/entities/category.orm-entity.ts`
- `src/infrastructure/database/typeorm/entities/tag.orm-entity.ts`
- `src/infrastructure/database/typeorm/entities/user-info.orm-entity.ts`
- `src/infrastructure/database/typeorm/entities/comment.orm-entity.ts`
- `src/infrastructure/database/typeorm/entities/like.orm-entity.ts`
- `src/infrastructure/database/typeorm/entities/notification.orm-entity.ts`
- `src/infrastructure/database/typeorm/entities/user-notification.orm-entity.ts`
- `src/infrastructure/database/typeorm/entities/news-approval.orm-entity.ts`
- `src/infrastructure/database/typeorm/mappers/user.mapper.ts`
- `src/infrastructure/database/typeorm/mappers/news.mapper.ts`
- `src/infrastructure/database/typeorm/mappers/category.mapper.ts`
- `src/infrastructure/database/typeorm/mappers/tag.mapper.ts`
- `src/infrastructure/database/typeorm/repositories/user.typeorm-repository.ts`
- `src/infrastructure/database/typeorm/repositories/news.typeorm-repository.ts`
- `src/infrastructure/database/typeorm/repositories/category.typeorm-repository.ts`
- `src/infrastructure/database/typeorm/repositories/tag.typeorm-repository.ts`
- `src/infrastructure/database/typeorm/migrations/1000000000000-InitSchema.ts`
- `src/infrastructure/email/email.service.ts` - Nodemailer email service
- `src/infrastructure/email/email.module.ts`
- `src/infrastructure/file-storage/file-storage.service.ts` - Local disk upload/delete
- `src/infrastructure/file-storage/file-storage.module.ts`

### Application
- `src/application/auth/use-cases/authenticate-user.use-case.ts`
- `src/application/auth/use-cases/authenticate-user.use-case.spec.ts`
- `src/application/auth/use-cases/verify-token.use-case.ts`
- `src/application/auth/dtos/auth-request.dto.ts`
- `src/application/auth/dtos/auth-response.dto.ts`
- `src/application/user/use-cases/register-user.use-case.ts`
- `src/application/user/use-cases/register-user.use-case.spec.ts`
- `src/application/user/use-cases/get-user.use-case.ts`
- `src/application/user/use-cases/get-user.use-case.spec.ts`
- `src/application/user/use-cases/get-all-users.use-case.ts`
- `src/application/user/use-cases/create-user.use-case.ts`
- `src/application/user/use-cases/update-user.use-case.ts`
- `src/application/user/use-cases/update-user-field.use-case.ts`
- `src/application/user/use-cases/delete-user.use-case.ts`
- `src/application/user/use-cases/approve-user.use-case.ts`
- `src/application/user/use-cases/assign-role.use-case.ts`
- `src/application/user/use-cases/remove-role.use-case.ts`
- `src/application/user/dtos/user-registration.dto.ts`
- `src/application/user/dtos/user-response.dto.ts`
- `src/application/user/dtos/user-for-news.dto.ts`
- `src/application/user/dtos/user-subscriptions.dto.ts`
- `src/application/user/dtos/update-role-request.dto.ts`
- `src/application/news/use-cases/create-news.use-case.ts`
- `src/application/news/use-cases/create-news.use-case.spec.ts`
- `src/application/news/use-cases/update-news.use-case.ts`
- `src/application/news/use-cases/delete-news.use-case.ts`
- `src/application/news/use-cases/get-all-news.use-case.ts`
- `src/application/news/use-cases/get-news-by-id.use-case.ts`
- `src/application/news/use-cases/get-news-by-category.use-case.ts`
- `src/application/news/use-cases/get-news-by-status.use-case.ts`
- `src/application/news/use-cases/get-news-by-status-and-author.use-case.ts`
- `src/application/news/use-cases/get-news-by-category-and-status.use-case.ts`
- `src/application/news/dtos/news-create.dto.ts`
- `src/application/news/dtos/news-update.dto.ts`
- `src/application/news/dtos/news-response.dto.ts`
- `src/application/category/use-cases/create-category.use-case.ts`
- `src/application/category/use-cases/update-category.use-case.ts`
- `src/application/category/use-cases/delete-category.use-case.ts`
- `src/application/category/use-cases/get-all-categories.use-case.ts`
- `src/application/category/use-cases/get-category-by-id.use-case.ts`
- `src/application/category/dtos/category-response.dto.ts`
- `src/application/category/dtos/category-create.dto.ts`
- `src/application/tag/use-cases/create-tag.use-case.ts`
- `src/application/tag/use-cases/get-all-tags.use-case.ts`
- `src/application/tag/use-cases/get-tag-by-id.use-case.ts`
- `src/application/tag/use-cases/get-last-three-tags.use-case.ts`
- `src/application/tag/dtos/tag-response.dto.ts`
- `src/application/tag/dtos/tag-create.dto.ts`
- `src/application/subscription/use-cases/get-user-subscriptions.use-case.ts`
- `src/application/subscription/use-cases/subscribe.use-case.ts`
- `src/application/subscription/use-cases/unsubscribe.use-case.ts`

### Presentation
- `src/main.ts` - App bootstrap, CORS, ValidationPipe, GlobalExceptionFilter, port 8080
- `src/app.module.ts` - Root module wiring all feature modules
- `src/presentation/shared/response/success-response.dto.ts`
- `src/presentation/shared/response/error-response.dto.ts`
- `src/presentation/shared/filters/global-exception.filter.ts`
- `src/presentation/shared/guards/jwt-auth.guard.ts`
- `src/presentation/shared/guards/roles.guard.ts`
- `src/presentation/shared/guards/approved.guard.ts`
- `src/presentation/shared/decorators/roles.decorator.ts`
- `src/presentation/shared/decorators/current-user.decorator.ts`
- `src/presentation/auth/auth.controller.ts`
- `src/presentation/auth/auth.controller.spec.ts`
- `src/presentation/auth/jwt.strategy.ts`
- `src/presentation/auth/auth.module.ts`
- `src/presentation/users/users.controller.ts`
- `src/presentation/users/users.controller.spec.ts`
- `src/presentation/users/users.module.ts`
- `src/presentation/admin/admin.controller.ts`
- `src/presentation/admin/admin.controller.spec.ts`
- `src/presentation/admin/admin.module.ts`
- `src/presentation/news/news.controller.ts`
- `src/presentation/news/news.controller.spec.ts`
- `src/presentation/news/news.module.ts`
- `src/presentation/categories/categories.controller.ts`
- `src/presentation/categories/categories.controller.spec.ts`
- `src/presentation/categories/categories.module.ts`
- `src/presentation/tags/tags.controller.ts`
- `src/presentation/tags/tags.controller.spec.ts`
- `src/presentation/tags/tags.module.ts`
- `src/presentation/subscriptions/subscriptions.controller.ts`
- `src/presentation/subscriptions/subscriptions.controller.spec.ts`
- `src/presentation/subscriptions/subscriptions.module.ts`
- `src/presentation/files/files.controller.ts`
- `src/presentation/files/files.controller.spec.ts`
- `src/presentation/files/files.module.ts`

### Config
- `.env` - Environment variables (DATABASE_URL, JWT_SECRET, MAIL_USERNAME, MAIL_PASSWORD, UPLOAD_DIR, NODE_ENV)
- `.env.example` - Example env file (no secrets)
- `tsconfig.json` - Strict mode settings

### Tests
- `test/auth.e2e-spec.ts` - E2E integration test for auth flows
- `test/users.e2e-spec.ts` - E2E integration test for user CRUD
- `test/news.e2e-spec.ts` - E2E integration test for news CRUD
- `test/jest-e2e.json` - Jest config for integration tests

---

### Notes

- Unit tests should be placed alongside the code files they test (e.g., `register-user.use-case.ts` and `register-user.use-case.spec.ts` in the same directory).
- Use `npx jest` to run all unit tests. Use `npx jest --config test/jest-e2e.json` for integration/e2e tests.
- Always keep `synchronize: false` in TypeORM config — use migrations for all schema changes.
- API contracts (URLs, HTTP methods, request/response shapes, status codes) must **never** change from the Java backend.
- The `POST /auth` response is `{ token: string }` with **no** `SuccessResponse` wrapper — this is intentional to match the Java contract.
- The subscriptions path is `/user/subscriptions` (singular `user`), not `/users/subscriptions`.

---

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

---

## Tasks

---

- [x] 1.0 Project Scaffold & Global Configuration
  - [x] 1.1 Remove the default NestJS scaffold boilerplate (`app.controller.ts`, `app.controller.spec.ts`, `app.service.ts`) and clean up `app.module.ts`
  - [x] 1.2 Update `tsconfig.json` to enable strict mode: `"strict": true`, `"strictNullChecks": true`, `"noImplicitAny": true`, `"experimentalDecorators": true`, `"emitDecoratorMetadata": true`
  - [x] 1.3 Install all required dependencies: `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/typeorm`, `typeorm`, `pg`, `@nestjs/config`, `@nestjs/platform-express`, `multer`, `bcrypt`, `class-validator`, `class-transformer`, `nodemailer`
  - [x] 1.4 Install all required dev dependencies: `@types/passport-jwt`, `@types/bcrypt`, `@types/multer`, `@types/nodemailer`
  - [x] 1.5 Create `.env` file with all required variables: `DATABASE_URL`, `JWT_SECRET`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `UPLOAD_DIR`, `NODE_ENV`
  - [x] 1.6 Create `.env.example` with the same keys but empty values; add `.env` to `.gitignore`
  - [x] 1.7 Create `src/presentation/shared/response/success-response.dto.ts` — `SuccessResponseDto<T>` with `data`, `message`, `status` fields
  - [x] 1.8 Create `src/presentation/shared/response/error-response.dto.ts` — `ErrorResponseDto` with `error`, `message`, `status` fields
  - [x] 1.9 Create `src/presentation/shared/filters/global-exception.filter.ts` — catches `BusinessException` and `HttpException`, returns `{ error, message, status }` envelope
  - [x] 1.10 Update `src/main.ts`: set port to `8080`, enable CORS for `localhost:5173` and `localhost:5174` with `credentials: true`, apply global `ValidationPipe` (`whitelist: true, transform: true`), apply `GlobalExceptionFilter`
  - [x] 1.11 Update `src/app.module.ts` to import `ConfigModule.forRoot({ isGlobal: true })`

---

- [x] 2.0 Domain Layer
  - [x] 2.1 Create `src/core/shared/enums/user-role.enum.ts` — `UserRole` enum: `ADMIN`, `EDITOR`, `USER`
  - [x] 2.2 Create `src/core/shared/enums/news-status.enum.ts` — `NewsStatus` enum: `draft`, `published`, `archived`
  - [x] 2.3 Create `src/core/shared/enums/approval-status.enum.ts` — `ApprovalStatus` enum: `pending`, `approved`, `rejected`
  - [x] 2.4 Create `src/core/shared/exceptions/business.exception.ts` — base `BusinessException` extending `Error` with `message` and `statusCode` (default 400)
  - [x] 2.5 Create `src/core/domain/user/entities/user.domain.ts` — pure TS `UserDomain` class with all fields (id, username, email, passwordHash, isApproved, roles, createdAt, and optional profile fields) and a `hasRole(role)` method
  - [x] 2.6 Create `src/core/domain/user/repositories/user.repository.interface.ts` — `IUserRepository` interface with methods: `findAll`, `findById`, `findByUsername`, `findByEmail`, `save`, `update`, `delete`, `approve`, `assignRole`, `removeRole`; export `USER_REPOSITORY` symbol
  - [x] 2.7 Create user domain exceptions: `user-not-found.exception.ts`, `user-already-exists.exception.ts`, `user-email-already-exists.exception.ts`, `user-not-approved.exception.ts` — all extend `BusinessException`
  - [x] 2.8 Create `src/core/domain/news/entities/news.domain.ts` — pure TS `NewsDomain` class with all fields
  - [x] 2.9 Create `src/core/domain/news/repositories/news.repository.interface.ts` — `INewsRepository` with methods: `findAll`, `findById`, `findByCategory`, `findByStatus`, `findByStatusAndAuthor`, `findByCategoryAndStatus`, `save`, `update`, `delete`; export `NEWS_REPOSITORY` symbol
  - [x] 2.10 Create `src/core/domain/news/exceptions/news-not-found.exception.ts`
  - [x] 2.11 Create `src/core/domain/category/repositories/category.repository.interface.ts` — `ICategoryRepository` with `findAll`, `findById`, `save`, `update`, `delete`; export `CATEGORY_REPOSITORY` symbol
  - [x] 2.12 Create `src/core/domain/category/exceptions/category-not-found.exception.ts`
  - [x] 2.13 Create `src/core/domain/tag/repositories/tag.repository.interface.ts` — `ITagRepository` with `findAll`, `findById`, `findLastThree`, `save`; export `TAG_REPOSITORY` symbol
  - [x] 2.14 Create `src/core/domain/tag/exceptions/tag-not-found.exception.ts`

---

- [x] 3.0 Infrastructure Layer
  - [x] 3.1 Create `src/infrastructure/database/typeorm/entities/role.orm-entity.ts` — `roles` table with `id` and `name` columns
  - [x] 3.2 Create `src/infrastructure/database/typeorm/entities/user-info.orm-entity.ts` — `user_info` table with profile fields (`firstName`, `lastName`, `surname`, `position`, `department`, `avatarUrl`)
  - [x] 3.3 Create `src/infrastructure/database/typeorm/entities/user.orm-entity.ts` — `users` table; `@ManyToMany` to `RoleOrmEntity` via `user_roles` join table; `@OneToOne` to `UserInfoOrmEntity`; `@ManyToMany` to `NewsCategoryOrmEntity` via `user_subscriptions`
  - [x] 3.4 Create `src/infrastructure/database/typeorm/entities/category.orm-entity.ts` — `news_categories` table with `id` and `name`
  - [x] 3.5 Create `src/infrastructure/database/typeorm/entities/tag.orm-entity.ts` — `tags` table with `id` and `name`
  - [x] 3.6 Create `src/infrastructure/database/typeorm/entities/news.orm-entity.ts` — `news` table; `@ManyToOne` to `UserOrmEntity` (author) and `NewsCategoryOrmEntity`; `@ManyToMany` to `TagOrmEntity` via `news_tags`; `status`, `publishedAt`, `createdAt`, `updatedAt` columns
  - [x] 3.7 Create `src/infrastructure/database/typeorm/entities/comment.orm-entity.ts` — `comments` table with content, `@ManyToOne` to `UserOrmEntity` and `NewsOrmEntity`, `createdAt`
  - [x] 3.8 Create `src/infrastructure/database/typeorm/entities/like.orm-entity.ts` — `likes` table with `@ManyToOne` to `UserOrmEntity` and `NewsOrmEntity`
  - [x] 3.9 Create `src/infrastructure/database/typeorm/entities/notification.orm-entity.ts` — `notifications` table with `type`, `message`, `createdAt`
  - [x] 3.10 Create `src/infrastructure/database/typeorm/entities/user-notification.orm-entity.ts` — `user_notifications` join table linking `UserOrmEntity` to `NotificationOrmEntity` with `isRead` flag
  - [x] 3.11 Create `src/infrastructure/database/typeorm/entities/news-approval.orm-entity.ts` — `news_approvals` table with status, `@ManyToOne` to `NewsOrmEntity` and reviewer `UserOrmEntity`
  - [x] 3.12 Create `src/infrastructure/database/typeorm/mappers/user.mapper.ts` — static `toDomain(orm: UserOrmEntity): UserDomain`
  - [x] 3.13 Create `src/infrastructure/database/typeorm/mappers/news.mapper.ts` — static `toDomain(orm: NewsOrmEntity): NewsDomain`
  - [x] 3.14 Create `src/infrastructure/database/typeorm/mappers/category.mapper.ts` and `tag.mapper.ts`
  - [x] 3.15 Create `src/infrastructure/database/typeorm/repositories/user.typeorm-repository.ts` — implements `IUserRepository`; all methods use `this.repo` with relations `['roles', 'userInfo']`
  - [x] 3.16 Create `src/infrastructure/database/typeorm/repositories/news.typeorm-repository.ts` — implements `INewsRepository`; load relations `['author', 'category', 'tags']`
  - [x] 3.17 Create `src/infrastructure/database/typeorm/repositories/category.typeorm-repository.ts` — implements `ICategoryRepository`
  - [x] 3.18 Create `src/infrastructure/database/typeorm/repositories/tag.typeorm-repository.ts` — implements `ITagRepository`; `findLastThree` orders by `id DESC` and limits to 3
  - [x] 3.19 Create `src/infrastructure/database/database.module.ts` — `TypeOrmModule.forRootAsync` using `ConfigService`; `synchronize: false`; `migrationsRun: true`
  - [x] 3.20 Create `src/infrastructure/database/data-source.ts` — standalone `DataSource` for TypeORM CLI (reads from `process.env.DATABASE_URL`)
  - [x] 3.21 Generate the initial TypeORM migration: `npx typeorm migration:generate src/infrastructure/database/typeorm/migrations/InitSchema -d src/infrastructure/database/data-source.ts`
  - [x] 3.22 Create `src/infrastructure/email/email.service.ts` — `EmailService` with `sendHtmlMessage(to, subject, html)` using Nodemailer transporter configured from `ConfigService`
  - [x] 3.23 Create `src/infrastructure/email/email.module.ts` — exports `EmailService`
  - [x] 3.24 Create `src/infrastructure/file-storage/file-storage.service.ts` — `saveFile(file, category): string` (saves to `UPLOAD_DIR/category/`) and `deleteFile(category, fileName): void`
  - [x] 3.25 Create `src/infrastructure/file-storage/file-storage.module.ts` — exports `FileStorageService`

---

- [x] 4.0 Application Layer (Use Cases & DTOs)
  - [x] 4.1 Create `src/application/auth/dtos/auth-request.dto.ts` — `username: string`, `password: string` with `class-validator` decorators
  - [x] 4.2 Create `src/application/auth/use-cases/authenticate-user.use-case.ts` — finds user by username, validates bcrypt password, checks `isApproved`, returns signed JWT with payload `{ sub: username, roles }`
  - [x] 4.3 Create `src/application/auth/use-cases/verify-token.use-case.ts` — validates the token is still active (used by `GET /verify-token`)
  - [x] 4.4 Create `src/application/user/dtos/user-registration.dto.ts` — `username`, `email`, `password`, `lastName`, `firstName`, optional `surname`, `position`, `department`
  - [x] 4.5 Create `src/application/user/dtos/user-response.dto.ts` — matches Java `UserResponseDTO` exactly: `id`, `username`, `email`, `lastName`, `firstName`, `surname`, `position`, `department`, `avatarUrl`, `isApproved`, `roles`
  - [x] 4.6 Create `src/application/user/dtos/user-for-news.dto.ts` — minimal user shape embedded in news responses
  - [x] 4.7 Create `src/application/user/dtos/user-subscriptions.dto.ts` — wraps list of subscribed categories
  - [x] 4.8 Create `src/application/user/dtos/update-role-request.dto.ts` — `role: UserRole`
  - [x] 4.9 Create `src/application/user/use-cases/register-user.use-case.ts` — checks for existing username/email, hashes password with bcrypt (salt 10), saves user, sends registration email via `EmailService`
  - [x] 4.10 Create `src/application/user/use-cases/get-user.use-case.ts` — finds by id, throws `UserNotFoundException` if not found
  - [x] 4.11 Create `src/application/user/use-cases/get-all-users.use-case.ts`
  - [x] 4.12 Create `src/application/user/use-cases/create-user.use-case.ts` — admin-side user creation (similar to register but no email sent)
  - [x] 4.13 Create `src/application/user/use-cases/update-user.use-case.ts` — full PUT update
  - [x] 4.14 Create `src/application/user/use-cases/update-user-field.use-case.ts` — partial PATCH update accepting `Record<string, any>`
  - [x] 4.15 Create `src/application/user/use-cases/delete-user.use-case.ts` — throws `UserNotFoundException` if not found before deleting
  - [x] 4.16 Create `src/application/user/use-cases/approve-user.use-case.ts`
  - [x] 4.17 Create `src/application/user/use-cases/assign-role.use-case.ts`
  - [x] 4.18 Create `src/application/user/use-cases/remove-role.use-case.ts`
  - [x] 4.19 Create `src/application/news/dtos/news-create.dto.ts` — `title`, `content`, optional `image`, `categoryId`, `tagIds: number[]`, `status`
  - [x] 4.20 Create `src/application/news/dtos/news-update.dto.ts` — same fields as create, all optional
  - [x] 4.21 Create `src/application/news/dtos/news-response.dto.ts` — matches Java `NewsDTO`: `id`, `title`, `content`, `image`, `author: UserForNewsDto`, `tags`, `status`, `publishedAt`, `category`
  - [x] 4.22 Create `src/application/news/use-cases/create-news.use-case.ts`
  - [x] 4.23 Create `src/application/news/use-cases/update-news.use-case.ts`
  - [x] 4.24 Create `src/application/news/use-cases/delete-news.use-case.ts`
  - [x] 4.25 Create `src/application/news/use-cases/get-all-news.use-case.ts`
  - [x] 4.26 Create `src/application/news/use-cases/get-news-by-id.use-case.ts`
  - [x] 4.27 Create `src/application/news/use-cases/get-news-by-category.use-case.ts`
  - [x] 4.28 Create `src/application/news/use-cases/get-news-by-status.use-case.ts`
  - [x] 4.29 Create `src/application/news/use-cases/get-news-by-status-and-author.use-case.ts`
  - [x] 4.30 Create `src/application/news/use-cases/get-news-by-category-and-status.use-case.ts`
  - [x] 4.31 Create category DTOs: `category-response.dto.ts` (`id`, `name`), `category-create.dto.ts` (`name: string`)
  - [x] 4.32 Create category use cases: `create-category`, `update-category`, `delete-category`, `get-all-categories`, `get-category-by-id`
  - [x] 4.33 Create tag DTOs: `tag-response.dto.ts` (`id`, `name`), `tag-create.dto.ts` (`name: string`)
  - [x] 4.34 Create tag use cases: `create-tag`, `get-all-tags`, `get-tag-by-id`, `get-last-three-tags`
  - [x] 4.35 Create subscription use cases: `get-user-subscriptions`, `subscribe`, `unsubscribe`

---

- [ ] 5.0 Presentation Layer
  - [x] 5.1 Create `src/presentation/shared/guards/jwt-auth.guard.ts` — extends `AuthGuard('jwt')`
  - [x] 5.2 Create `src/presentation/shared/guards/roles.guard.ts` — reads `ROLES_KEY` metadata via `Reflector`, checks `user.roles` includes at least one required role, throws `ForbiddenException` otherwise
  - [x] 5.3 Create `src/presentation/shared/guards/approved.guard.ts` — throws `UnauthorizedException` if `user.isApproved` is false
  - [x] 5.4 Create `src/presentation/shared/decorators/roles.decorator.ts` — `@Roles(...roles: UserRole[])` using `SetMetadata`
  - [x] 5.5 Create `src/presentation/shared/decorators/current-user.decorator.ts` — `@CurrentUser()` param decorator extracting `request.user`
  - [x] 5.6 Create `src/presentation/auth/jwt.strategy.ts` — `PassportStrategy(Strategy)`, reads `JWT_SECRET` from config, validates payload by loading user from repo, rejects unapproved users
  - [x] 5.7 Create `src/presentation/auth/auth.controller.ts` — `POST /auth` returns `{ token }` (no wrapper), `POST /register` returns `SuccessResponseDto`, `GET /me` returns `SuccessResponseDto`, `GET /verify-token` returns `SuccessResponseDto`
  - [x] 5.8 Create `src/presentation/auth/auth.module.ts` — imports `PassportModule`, `JwtModule.registerAsync` (secret from config, expiresIn 14400), provides `JwtStrategy` and auth use cases
  - [x] 5.9 Create `src/presentation/users/users.controller.ts` — all 6 user endpoints with correct guards (`JwtAuthGuard`, `RolesGuard`) and roles
  - [x] 5.10 Create `src/presentation/users/users.module.ts`
  - [x] 5.11 Create `src/presentation/admin/admin.controller.ts` — `PATCH /admin/users/:id/approve`, `PATCH /admin/users/:id/roles`, `DELETE /admin/users/:id/roles` (body contains `{ role }`), all ADMIN only
  - [x] 5.12 Create `src/presentation/admin/admin.module.ts`
  - [x] 5.13 Create `src/presentation/news/news.controller.ts` — all 9 news endpoints; note `GET /news/status` must be declared **before** `GET /news/:id` to avoid route conflict
  - [x] 5.14 Create `src/presentation/news/news.module.ts`
  - [x] 5.15 Create `src/presentation/categories/categories.controller.ts` — all 5 category endpoints
  - [x] 5.16 Create `src/presentation/categories/categories.module.ts`
  - [x] 5.17 Create `src/presentation/tags/tags.controller.ts` — all 4 tag endpoints; `GET /tags/last-three` must be declared **before** `GET /tags/:id`
  - [x] 5.18 Create `src/presentation/tags/tags.module.ts`
  - [x] 5.19 Create `src/presentation/subscriptions/subscriptions.controller.ts` — `@Controller('user')` prefix; all 3 subscription endpoints at `/user/subscriptions`
  - [x] 5.20 Create `src/presentation/subscriptions/subscriptions.module.ts`
  - [ ] 5.21 Create `src/presentation/files/files.controller.ts` — `POST /upload` (Multer `@UseInterceptors(FileInterceptor)`), `DELETE /delete-image` (body `{ category, fileName }`)
  - [ ] 5.22 Create `src/presentation/files/files.module.ts`
  - [ ] 5.23 Update `src/app.module.ts` to import all feature modules: `DatabaseModule`, `EmailModule`, `FileStorageModule`, `AuthModule`, `UsersModule`, `AdminModule`, `NewsModule`, `CategoriesModule`, `TagsModule`, `SubscriptionsModule`, `FilesModule`

---

- [ ] 6.0 Testing (Unit & Integration Tests per Module)
  - [ ] 6.1 Write unit tests for `authenticate-user.use-case.ts` — mock `IUserRepository` and `JwtService`; test valid credentials, wrong password, unapproved user
  - [ ] 6.2 Write unit tests for `register-user.use-case.ts` — mock repo and `EmailService`; test successful registration, duplicate username, duplicate email
  - [ ] 6.3 Write unit tests for `get-user.use-case.ts` — test found case and `UserNotFoundException`
  - [ ] 6.4 Write unit tests for `approve-user.use-case.ts`, `assign-role.use-case.ts`, `remove-role.use-case.ts`
  - [ ] 6.5 Write unit tests for `create-news.use-case.ts`, `update-news.use-case.ts`, `delete-news.use-case.ts`
  - [ ] 6.6 Write unit tests for all news query use cases (`getById`, `getByCategory`, `getByStatus`, `getByStatusAndAuthor`, `getByCategoryAndStatus`)
  - [ ] 6.7 Write unit tests for category use cases: create, update, delete, get all, get by id
  - [ ] 6.8 Write unit tests for tag use cases: create, get all, get by id, get last three
  - [ ] 6.9 Write unit tests for subscription use cases: get subscriptions, subscribe, unsubscribe
  - [ ] 6.10 Write integration tests for auth flows (`test/auth.e2e-spec.ts`): register → approve → login → `GET /me` → `GET /verify-token`
  - [ ] 6.11 Write integration tests for user CRUD (`test/users.e2e-spec.ts`): create, get, update (PUT + PATCH), delete, role management
  - [ ] 6.12 Write integration tests for news CRUD (`test/news.e2e-spec.ts`): create, update, delete, all query variants
  - [ ] 6.13 Confirm all tests pass: `npx jest` (unit) and `npx jest --config test/jest-e2e.json` (integration)

---

- [ ] 7.0 Validation & Cutover Verification
  - [ ] 7.1 Run the NestJS app on port `8081` (`PORT=8081 npm run start:dev`) while the Java backend stays on `8080`
  - [ ] 7.2 Run smoke tests against NestJS (`localhost:8081`): register, auth, `GET /me`, `GET /news`, `GET /news/status?status=published`
  - [ ] 7.3 Perform side-by-side comparison: for each endpoint call both `:8080` (Java) and `:8081` (NestJS) and verify response shape, data structure, and HTTP status codes match
  - [ ] 7.4 Verify error contract: hit a missing resource and confirm `{ error, message, status: 404 }` is returned; test 401 with invalid token; test 403 with insufficient role
  - [ ] 7.5 Verify the JWT is cross-compatible: obtain a token from the Java backend (`POST :8080/auth`) and use it on the NestJS backend (`GET :8081/me`) — it must succeed
  - [ ] 7.6 Switch the frontend `VITE_API_URL` to `http://localhost:8081` and manually verify all user-facing flows: login, browse news, create news (EDITOR), approve user (ADMIN), manage subscriptions, upload file
  - [ ] 7.7 Confirm all `401`, `403`, `404` errors display correctly in the frontend UI
  - [ ] 7.8 Switch the app to port `8080` (update `.env`), stop the Java backend, and confirm the frontend works with the NestJS backend as the sole backend
