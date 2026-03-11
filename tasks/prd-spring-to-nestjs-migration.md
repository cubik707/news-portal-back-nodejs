# PRD: Migrate News Portal Backend from Spring Boot (Java) to NestJS (TypeScript)

## 1. Introduction / Overview

The News Portal currently runs on a Spring Boot (Java) backend. This project migrates the entire backend to **NestJS + TypeScript + PostgreSQL + TypeORM**, hosted in the existing `news-portal-back-nodejs` repository.

**Critical constraint:** Not a single API contract may change. The frontend must continue to work without any modifications after the cutover.

**Architecture:** The new backend must follow **DDD (Domain-Driven Design) + Clean Architecture**, separating Domain, Application, Infrastructure, and Presentation layers.

**Strategy:** Full cutover — the complete NestJS backend is built and validated, then traffic is switched from the Java backend all at once.

---

## 2. Goals

1. Reimplement every API endpoint with identical URLs, HTTP methods, request/response shapes, and HTTP status codes.
2. Preserve the existing JWT contract (same secret, same payload shape `{ sub, roles }`, same 4-hour expiry).
3. Implement **all** features to full working status — including comments, likes, notifications, and email.
4. Apply DDD + Clean Architecture with clear layer boundaries (Domain → Application → Infrastructure → Presentation).
5. Achieve unit + integration test coverage for every module.
6. Successfully deploy the NestJS backend to the production/staging environment and confirm the frontend operates without changes.

---

## 3. User Stories

- **As a frontend developer**, I want the NestJS backend to expose the exact same API contracts as the Java backend, so that I do not need to change a single line of frontend code.
- **As a registered user**, I want to register, log in, read news, manage subscriptions, and interact (comments, likes) the same way I did before.
- **As an EDITOR**, I want to create, update, and delete news articles and tags using the same endpoints and payloads.
- **As an ADMIN**, I want to manage users (approve, assign/remove roles, delete), manage categories, and perform all admin operations via the same admin endpoints.
- **As a developer**, I want the codebase to follow Clean Architecture and DDD so that business logic is decoupled from the framework and easy to test.

---

## 4. Functional Requirements

### 4.1 Project Scaffold

1. The system must be built with NestJS (latest stable), TypeScript (strict mode), TypeORM, and PostgreSQL.
2. The app must listen on port `8080` to match the Java backend.
3. CORS must allow `http://localhost:5173` and `http://localhost:5174` with `credentials: true`.
4. A global `ValidationPipe` with `{ whitelist: true, transform: true }` must be applied.
5. A global `ExceptionFilter` must catch all exceptions and return the standard error envelope `{ error, message, status }`.

### 4.2 Response Envelope (MUST NOT change)

6. Every successful response must be wrapped as:
   ```json
   { "data": <payload>, "message": "...", "status": 200 }
   ```
7. Every error response must follow:
   ```json
   { "error": "...", "message": "...", "status": 4xx }
   ```

### 4.3 Auth Endpoints

8. `POST /register` — register a new user; send a confirmation email; return `SuccessResponse<UserResponseDTO>`.
9. `POST /auth` — validate credentials; return `{ token: string }` (no wrapper, exactly this shape).
10. `GET /me` — return current authenticated user as `SuccessResponse<UserResponseDTO>`.
11. `GET /verify-token` — verify the JWT; return `SuccessResponse`.

### 4.4 JWT

12. JWT secret must be read from the `JWT_SECRET` environment variable (must be the same value used in the Java backend to allow tokens to remain valid during cutover).
13. Token expiry must be `14400` seconds (4 hours).
14. JWT payload must contain `sub` (username) and `roles` (array of role strings).
15. Unapproved users must receive `401 Unauthorized` on any protected endpoint.

### 4.5 User Endpoints

16. `GET /users` — return all users (ADMIN only).
17. `GET /users/:id` — return a user by ID (JWT required).
18. `POST /users` — create a user (ADMIN only).
19. `PUT /users/:id` — full update of a user (JWT required).
20. `PATCH /users/:id` — partial update of a user (JWT required).
21. `DELETE /users/:id` — delete a user (ADMIN only).

### 4.6 Admin Endpoints

22. `PATCH /admin/users/:id/approve` — approve a user (ADMIN only).
23. `PATCH /admin/users/:id/roles` — assign a role `{ role: UserRole }` (ADMIN only).
24. `DELETE /admin/users/:id/roles` — remove a role `{ role: UserRole }` from request body (ADMIN only).

### 4.7 News Endpoints

25. `GET /news` — return all news (public).
26. `GET /news/:id` — return a single news item (public).
27. `GET /news/category/:categoryId` — return news by category (public).
28. `GET /news/status?status=` — return news by status via **query param** (public).
29. `GET /news/author/:authorId/status?status=` — return news by author + status (public).
30. `GET /news/category/:categoryId/status?status=` — return news by category + status (public).
31. `POST /news` — create news (EDITOR only).
32. `PUT /news/:id` — update news (EDITOR only).
33. `DELETE /news/:id` — delete news (EDITOR or ADMIN).

### 4.8 Category Endpoints

34. `GET /categories` — list all categories (public).
35. `GET /categories/:id` — get category by ID (public).
36. `POST /categories` — create category (ADMIN only).
37. `PUT /categories/:id` — update category (ADMIN only).
38. `DELETE /categories/:id` — delete category (ADMIN only).

### 4.9 Tag Endpoints

39. `GET /tags` — list all tags (public).
40. `GET /tags/:id` — get tag by ID (public).
41. `GET /tags/last-three` — get last 3 tags (public).
42. `POST /tags` — create tag (EDITOR only).

### 4.10 Subscription Endpoints

43. `GET /user/subscriptions` — get current user's subscriptions (JWT required). Note: path is `/user/` not `/users/`.
44. `POST /user/subscriptions/:subscriptionId` — subscribe to a category (JWT required).
45. `DELETE /user/subscriptions/:subscriptionId` — unsubscribe from a category (JWT required).

### 4.11 File Endpoints

46. `POST /upload` — upload a file via `multipart/form-data` (file + category fields); return `SuccessResponse<string>` (file URL/path).
47. `DELETE /delete-image` — delete an image by `{ category, fileName }` from request body.

### 4.12 Domain Layer

48. Domain entities (`UserDomain`, `NewsDomain`, etc.) must be pure TypeScript classes with no ORM decorators.
49. Repository interfaces must be defined in the domain layer and injected via symbols (e.g., `USER_REPOSITORY`).
50. Domain exceptions (`UserNotFoundException`, `UserAlreadyExistsException`, `UserNotApprovedException`, `NewsNotFoundException`, `NewsCategoryNotFoundException`, `TagNotFoundException`) must extend `BusinessException`.

### 4.13 Infrastructure Layer

51. TypeORM ORM entities must be separate from domain entities and contain all ORM decorators.
52. Mapper classes must translate between ORM entities and domain entities (e.g., `UserMapper.toDomain()`).
53. TypeORM repository implementations must implement the domain repository interfaces.
54. The database must use **PostgreSQL**. MySQL-specific types must be converted to their PostgreSQL equivalents.
55. `synchronize` must be `false`; schema changes must be managed via TypeORM migrations.
56. Email must be sent via Nodemailer (SMTP/Gmail) configured from environment variables (`MAIL_USERNAME`, `MAIL_PASSWORD`).
57. File storage service must handle upload and delete operations using a configurable `UPLOAD_DIR`.

### 4.14 Application Layer (Use Cases)

58. Each use case must perform exactly one operation.
59. Use cases must depend only on domain repository interfaces, never on ORM entities or NestJS HTTP primitives.
60. The following use cases must be implemented (at minimum):
    - Auth: `AuthenticateUser`, `VerifyToken`
    - User: `RegisterUser`, `GetUser`, `GetAllUsers`, `CreateUser`, `UpdateUser`, `UpdateUserField`, `DeleteUser`, `ApproveUser`, `AssignRole`, `RemoveRole`
    - News: `CreateNews`, `UpdateNews`, `DeleteNews`, `GetAllNews`, `GetNewsById`, `GetNewsByCategory`, `GetNewsByStatus`, `GetNewsByStatusAndAuthor`, `GetNewsByCategoryAndStatus`
    - Category, Tag, Subscription: full CRUD / list use cases

### 4.15 Roles & Authorization

61. Three roles must exist: `ADMIN`, `EDITOR`, `USER`.
62. Role-based access must be enforced via a `RolesGuard` using the `@Roles()` decorator.
63. An `ApprovedGuard` must block unapproved users from protected actions.

### 4.16 Testing

64. Each module must have unit tests covering use-case logic (mocking repository interfaces).
65. Each module must have integration tests that test the full request → response cycle (using a real or in-memory test database).
66. The test suite must cover: auth flows, user CRUD, news CRUD, role management, subscription management.

### 4.17 Configuration & Environment

67. All secrets and environment-specific values must be loaded via `@nestjs/config` from a `.env` file.
68. Required environment variables: `DATABASE_URL`, `JWT_SECRET`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `UPLOAD_DIR`, `NODE_ENV`.

---

## 5. Non-Goals (Out of Scope)

- **No frontend changes** — the frontend codebase is not touched.
- **No API contract changes** — URLs, HTTP methods, request/response shapes, and status codes are frozen.
- **No parallel/gradual traffic shift** — this is a full cutover; no reverse proxy routing or incremental rollout is needed.
- **No new features** — only feature parity with the current Java backend.
- **No database schema redesign** — the PostgreSQL schema must represent the same data as the existing MySQL schema; column naming and table structure must match what the existing frontend and business logic expect.

---

## 6. Technical Considerations

### Stack

| Concern | Technology |
|---|---|
| Framework | NestJS (latest stable) |
| Language | TypeScript (strict mode) |
| ORM | TypeORM |
| Database | PostgreSQL |
| Auth | `@nestjs/passport` + `passport-jwt` + `@nestjs/jwt` |
| Validation | `class-validator` + `class-transformer` |
| Email | Nodemailer |
| File uploads | `@nestjs/platform-express` + Multer |
| Password hashing | bcrypt |

### Architecture Layers

```
src/
├── core/                  # Domain Layer (pure TypeScript, no framework deps)
│   ├── domain/
│   │   ├── user/
│   │   ├── news/
│   │   ├── category/
│   │   └── tag/
│   └── shared/
│       ├── enums/
│       └── exceptions/
├── application/           # Application Layer (use cases + DTOs)
│   ├── auth/
│   ├── user/
│   ├── news/
│   ├── category/
│   ├── tag/
│   └── subscription/
├── infrastructure/        # Infrastructure Layer (DB, email, files)
│   ├── database/
│   │   └── typeorm/
│   │       ├── entities/
│   │       ├── repositories/
│   │       ├── mappers/
│   │       └── migrations/
│   ├── email/
│   └── file-storage/
├── presentation/          # Presentation Layer (controllers, guards, filters)
│   ├── auth/
│   ├── users/
│   ├── admin/
│   ├── news/
│   ├── categories/
│   ├── tags/
│   ├── subscriptions/
│   ├── files/
│   └── shared/
│       ├── guards/
│       ├── decorators/
│       ├── filters/
│       └── response/
├── app.module.ts
└── main.ts
```

### MySQL → PostgreSQL Type Mapping

| MySQL | PostgreSQL |
|---|---|
| `INT AUTO_INCREMENT` | `SERIAL` |
| `TINYINT(1)` | `BOOLEAN` |
| `DATETIME` | `TIMESTAMP` |
| `ENUM(...)` | `VARCHAR` + CHECK constraint |

### JWT Compatibility Note

During cutover, existing browser tokens issued by the Java backend will be presented to the NestJS backend. Because `JWT_SECRET` is shared and the payload shape (`{ sub, roles }`) is identical, existing tokens will validate correctly and users will not need to log in again.

---

## 7. Success Metrics

The migration is considered **done** when ALL of the following are true:

1. **API contract parity:** Every endpoint in the contract table (Section 4) returns the correct response shape and HTTP status code — verified by running the smoke test suite against the NestJS server.
2. **Side-by-side validation:** For each endpoint, the NestJS response (running on `:8081`) matches the Java response (running on `:8080`) in structure and semantics.
3. **Frontend integration:** Pointing the frontend's `VITE_API_URL` (or equivalent) at the NestJS server, all user-facing features work correctly — login, news browsing, news creation (EDITOR), user approval (ADMIN), subscriptions, file upload.
4. **Error handling:** `401`, `403`, `404`, and `400` responses are returned correctly and displayed by the frontend.
5. **Test suite passes:** All unit and integration tests pass with no skipped tests.
6. **Deployed to staging/production:** The NestJS backend is deployed, the Java backend is decommissioned, and the live frontend operates without issues.

---

## 8. Open Questions

- [x] **Database migration strategy:** PostgreSQL instance starts fresh — no data migration from MySQL is required.
- [x] **File storage:** Local disk only. The `UPLOAD_DIR` environment variable points to a local directory; no object storage needed.
- [x] **Email in production:** This is a study project with no production environment. Gmail SMTP via Nodemailer is sufficient.
- [x] **Deployment target:** Docker and CI/CD will be added in a later phase, outside the scope of this PRD.
- [x] **Comments, likes, notifications:** Create TypeORM ORM entities for comments, likes, notifications, and user-notifications now (so the schema is complete), but do **not** implement API endpoints in this phase — REST endpoints for these will be added later.
