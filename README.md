# News Portal — Backend (Node.js)

A RESTful API for an **internal IT company news portal** built with **NestJS**, **TypeORM**, and **PostgreSQL**. The service handles authentication, news management with an approval workflow, categories, tags, file uploads, user subscriptions, and notifications.

## Table of Contents

- [News Portal — Backend (Node.js)](#news-portal--backend-nodejs)
  - [Table of Contents](#table-of-contents)
  - [Architecture](#architecture)
  - [Technologies](#technologies)
  - [Project Structure](#project-structure)
  - [API Endpoints](#api-endpoints)
    - [Auth](#auth)
    - [Users](#users)
    - [Admin](#admin)
    - [News](#news)
    - [Comments](#comments)
    - [Categories](#categories)
    - [Tags](#tags)
    - [Subscriptions](#subscriptions)
    - [Files](#files)
  - [Authentication \& Authorization](#authentication--authorization)
  - [Environment Variables](#environment-variables)
  - [Running the Project](#running-the-project)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)
  - [Database](#database)
    - [Migration commands](#migration-commands)
    - [Seed](#seed)
  - [Testing](#testing)

---

## Architecture

The project follows **Clean Architecture** (Hexagonal / Ports & Adapters), organized into four layers:

```
Presentation  →  Application  →  Core (Domain)  ←  Infrastructure
```

| Layer | Responsibility |
|---|---|
| **Core** | Domain entities, value objects, repository interfaces, domain exceptions |
| **Application** | Use cases — one class per operation, orchestrates domain and ports |
| **Infrastructure** | TypeORM repositories, JWT adapter, bcrypt, email, file storage |
| **Presentation** | NestJS controllers, guards, decorators, global exception filter |

**Key patterns:**
- **Use Case pattern** — each business operation is a dedicated class with a single `execute()` method
- **Port & Adapter** — external concerns (JWT, password hashing) are abstracted behind interfaces defined in the core layer
- **Repository pattern** — domain layer declares `IXxxRepository` interfaces; TypeORM implementations live in infrastructure

---

## Technologies

- **[NestJS 11](https://nestjs.com/)** — framework (controllers, DI, modules)
- **[TypeORM 0.3](https://typeorm.io/)** — ORM with migration support
- **[PostgreSQL](https://www.postgresql.org/)** — primary database
- **[Passport + JWT](https://docs.nestjs.com/security/authentication)** — authentication
- **[Bcrypt](https://github.com/kelektiv/node.bcrypt.js)** — password hashing (10 rounds)
- **[Nodemailer](https://nodemailer.com/)** — email notifications
- **[Multer](https://github.com/expressjs/multer)** — file uploads
- **[class-validator](https://github.com/typestack/class-validator)** — DTO validation
- **[Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest)** — unit and E2E testing

---

## Project Structure

```
src/
├── main.ts                        # Bootstrap, CORS, global pipes
├── app.module.ts                  # Root module
│
├── core/                          # Domain layer (no framework dependencies)
│   ├── domain/
│   │   ├── auth/                  # Auth-related exceptions
│   │   ├── category/              # Category entity, repository interface
│   │   ├── news/                  # News entity, repository interface
│   │   ├── tag/                   # Tag entity, repository interface
│   │   └── user/                  # User entity, repository interface
│   └── shared/                    # Enums, value objects, shared ports & exceptions
│
├── application/                   # Use cases & DTOs
│   ├── auth/                      # Login, register use cases
│   ├── category/                  # CRUD use cases for categories
│   ├── news/                      # CRUD use cases for news
│   ├── subscription/              # Subscribe / unsubscribe use cases
│   ├── tag/                       # Tag use cases
│   └── user/                      # User management use cases
│
├── infrastructure/                # Framework & external service adapters
│   ├── database/                  # TypeORM module, ORM entities, mappers, migrations
│   │   ├── data-source.ts         # TypeORM DataSource config
│   │   ├── seed.ts                # Database seed script (test data)
│   │   └── typeorm/
│   │       ├── entities/          # ORM entity classes
│   │       └── migrations/        # TypeORM migration files
│   ├── email/                     # Nodemailer email service
│   ├── file-storage/              # File upload / delete service
│   └── security/                  # JWT adapter, bcrypt password hasher
│
└── presentation/                  # HTTP layer
    ├── admin/                     # Admin-only endpoints
    ├── auth/                      # Login, register, /me endpoints
    ├── categories/                # Category endpoints
    ├── files/                     # Upload / delete file endpoints
    ├── news/                      # News endpoints
    ├── subscriptions/             # Subscription endpoints
    ├── tags/                      # Tag endpoints
    ├── users/                     # User endpoints
    └── shared/
        ├── decorators/            # @CurrentUser(), @Roles()
        ├── filters/               # Global exception filter
        └── guards/                # JwtAuthGuard, ApprovedGuard, RolesGuard

test/                              # E2E tests (Supertest)
```

---

## API Endpoints

All successful responses are wrapped in `{ data: T }`.

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth` | — | Login — returns JWT token |
| `POST` | `/register` | — | Register a new user |
| `GET` | `/me` | JWT + Approved | Get current user profile |
| `GET` | `/verify-token` | JWT | Verify token validity |

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/users` | JWT + Approved + Admin | List all users |
| `GET` | `/users/:id` | JWT + Approved | Get user by ID |
| `POST` | `/users` | JWT + Approved + Admin | Create user |
| `PUT` | `/users/:id` | JWT + Approved | Update user |
| `PATCH` | `/users/:id` | JWT + Approved | Partial update user |
| `DELETE` | `/users/:id` | JWT + Approved + Admin | Delete user |

### Admin

All `/admin` routes require **JWT + Approved + Admin** role.

| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/admin/users/:id/approve` | Approve a user |
| `PATCH` | `/admin/users/:id/roles` | Assign role to user |
| `DELETE` | `/admin/users/:id/roles` | Remove role from user |

### News

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/news` | — | Get all news |
| `GET` | `/news/:id` | — | Get news by ID |
| `GET` | `/news/status?status=` | — | Filter news by status |
| `GET` | `/news/category/:categoryId` | — | Get news by category |
| `GET` | `/news/category/:categoryId/status?status=` | — | Filter by category + status |
| `GET` | `/news/author/:authorId/status?status=` | — | Get news by author + status |
| `POST` | `/news` | JWT + Approved + Editor | Create news |
| `PUT` | `/news/:id` | JWT + Approved + Editor | Update news |
| `DELETE` | `/news/:id` | JWT + Approved + Editor/Admin | Delete news |

### Comments

All comment endpoints require **JWT + Approved** (registered and approved account). News responses (`GET /news`, `GET /news/:id`) now include a `commentCount` field.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/news/:newsId/comments` | JWT + Approved | List all comments for a news article (oldest first) |
| `POST` | `/news/:newsId/comments` | JWT + Approved | Post a new comment on a news article |
| `PUT` | `/comments/:id` | JWT + Approved | Edit own comment (author only) |
| `DELETE` | `/comments/:id` | JWT + Approved | Delete a comment (author or Admin) |

**Comment response shape:**
```json
{
  "id": "019571c4-...",
  "content": "Great article!",
  "author": { "id": "...", "username": "nikitin_dev", "firstName": "Ivan", "lastName": "Nikitin" },
  "newsId": "019571c4-...",
  "createdAt": "2026-03-24T10:00:00.000Z",
  "editedAt": null
}
```

**Migration note:** Run `npm run migration:run` after pulling this feature — migration `1000000000003-AddCommentsBoundedContext` recreates the `comments` table with UUID PK, `author_id`, `updated_at`, and nullable `edited_at` columns.

---

### News Approval Workflow

Editors submit drafts to admins for review. Admins approve or reject with a comment. Approved articles can be published by the editor.

**News Status Flow:**
```
draft → pending_review → approved → published
              ↓
           draft  (rejected → editor fixes and can resubmit)
```

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/news/:id/submit-for-approval` | JWT + Approved + Editor | Submit draft for review; body `{ adminId?: string }` |
| `POST` | `/news/:id/publish` | JWT + Approved + Editor | Publish an approved article |
| `GET` | `/news-approvals/pending` | JWT + Approved + Admin | List pending approvals visible to this admin |
| `GET` | `/news-approvals/my-activity` | JWT + Approved + Editor | Editor's own submission history |
| `GET` | `/news-approvals/badge` | JWT + Approved | `{ count: number }` — unread approval count for badge |
| `GET` | `/news-approvals/:id` | JWT + Approved | Get approval by ID |
| `POST` | `/news-approvals/:id/process` | JWT + Approved + Admin | Approve or reject; body `{ status: "approved"|"rejected", comment?: string }` |
| `PATCH` | `/news-approvals/:id/seen` | JWT + Approved | Mark approval as seen (clears badge for that item) |
| `GET` | `/users/admins` | JWT + Approved | List all admin users (for editor admin picker) |

**Badge logic:**
- Admin badge = count of pending approvals submitted to this admin (or broadcast) with `seenByAdminAt IS NULL`
- Editor badge = count of decided approvals (`approved` or `rejected`) with `seenByEditorAt IS NULL`

**Migration:** Run `npm run migration:run` — migration `1000000000005-NewsApprovalWorkflow` adds columns `submitted_to_admin_id`, `admin_id`, `seen_by_admin_at`, `seen_by_editor_at`, `created_at` to `news_approval` table.

---

### WebSocket — Approval Notifications

**Namespace:** `/approvals`

Connect with JWT authentication:
```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000/approvals', {
  auth: { token: '<jwt_access_token>' },
});
```

| Event | Direction | Payload | Trigger |
|-------|-----------|---------|---------|
| `approval:new` | Server → Admin room | `{ approvalId, newsId, newsTitle, editorName }` | Editor submits article for review |
| `approval:decided` | Server → Editor room | `{ approvalId, newsId, status, comment }` | Admin approves or rejects |

Each authenticated client joins a room keyed by their user ID. Unauthenticated connections are immediately disconnected.

**Environment variable required:** `JWT_SECRET` must be set (already required for HTTP auth).

---

### Categories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/categories` | — | List all categories |
| `GET` | `/categories/:id` | — | Get category by ID |
| `POST` | `/categories` | JWT + Approved + Admin | Create category |
| `PUT` | `/categories/:id` | JWT + Approved + Admin | Update category |
| `DELETE` | `/categories/:id` | JWT + Approved + Admin | Delete category |

### Tags

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/tags` | — | List all tags |
| `GET` | `/tags/last-three` | — | Get last 3 tags |
| `GET` | `/tags/:id` | — | Get tag by ID |
| `POST` | `/tags` | JWT + Approved + Editor | Create tag |

### Subscriptions

All `/user/subscriptions` routes require **JWT + Approved**.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/user/subscriptions` | Get current user's subscriptions |
| `POST` | `/user/subscriptions/:subscriptionId` | Subscribe to a category |
| `DELETE` | `/user/subscriptions/:subscriptionId` | Unsubscribe from a category |

### Files

All file routes require **JWT + Approved**.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/upload` | Upload file (`multipart/form-data`, field: `category`) |
| `DELETE` | `/delete-image` | Delete file (body: `category`, `fileName`) |

---

## Authentication & Authorization

**Authentication** is done via JWT Bearer tokens (4-hour expiry). Include the token in every protected request:

```
Authorization: Bearer <token>
```

**User Roles:**

| Role | Description |
|------|-------------|
| `USER` | Default role, read-only access |
| `EDITOR` | Can create, update, and delete news and tags |
| `ADMIN` | Full access including user and category management |

**Account approval:** After registration, a user account must be approved by an admin (`PATCH /admin/users/:id/approve`) before the user can access protected endpoints. The `ApprovedGuard` enforces this check on all protected routes.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# PostgreSQL connection
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=news_portal

# Secret used to sign JWT tokens
JWT_SECRET=your_jwt_secret

# Gmail credentials for sending emails (use an App Password)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# Directory for uploaded files (relative or absolute path)
UPLOAD_DIR=./uploads

# Application environment
NODE_ENV=development

# Log verbosity level (fatal | error | warn | info | debug | trace)
# Default: 'debug' in development, 'info' in production
LOG_LEVEL=debug
```

> **Logging behaviour**
> - In development (`NODE_ENV=development`) logs are colorized and human-readable via pino-pretty.
> - In production (`NODE_ENV=production`) logs are emitted as newline-delimited JSON.
> - HTTP request/response pairs are logged automatically. Status 2xx/3xx → `info`, 4xx → `warn`, 5xx → `error`.
> - Override the minimum log level at runtime with `LOG_LEVEL` (e.g. `LOG_LEVEL=warn` silences info/debug).

---

## Running the Project

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+

### Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials, JWT secret, etc.
   ```

3. **Create the database** (if it doesn't exist yet):
   ```bash
   psql -U postgres -c "CREATE DATABASE news_portal;"
   ```

4. **Run migrations** to create all tables:
   ```bash
   npm run migration:run
   ```

5. **(Optional) Seed the database** with test data:
   ```bash
   npm run seed
   ```

6. **Start in development mode** (auto-restart on changes):
   ```bash
   npm run start:dev
   ```

7. **Or build and run in production mode:**
   ```bash
   npm run build
   npm run start:prod
   ```

The server starts on **port 8080**.

---

## Database

### Migration commands

```bash
# Apply all pending migrations
npm run migration:run

# Revert the last applied migration
npm run migration:revert

# Generate a new migration based on entity changes
npm run migration:generate -- src/infrastructure/database/typeorm/migrations/MigrationName
```

### Seed

The seed script populates the database with realistic test data for an IT company portal.

Two commands are available:

```bash
# Add test data without touching existing records (idempotent — safe to re-run)
npm run seed

# Wipe all data first, then re-seed from scratch (useful for a clean slate)
npm run seed:fresh
```

> **Warning:** `seed:fresh` truncates all tables with `CASCADE`. All existing data will be permanently deleted.

**What gets created:**

| Entity | Count | Details |
|--------|-------|---------|
| Users | 7 | 1 admin, 2 editors, 4 developers/QA/DevOps |
| Categories | 7 | Разработка, DevOps и инфраструктура, Безопасность, etc. |
| Tags | 12 | TypeScript, NestJS, Docker, Kubernetes, CI/CD, etc. |
| News | 7 | 6 published, 1 draft |
| Comments | 8 | — |
| Likes | 12 | — |
| Approvals | 4 | — |
| Notifications | 4 + 10 user notifications | — |

**Test accounts** (password for all: `Password123!`):

| Username | Role | Position |
|----------|------|----------|
| `admin` | Admin | Системный администратор (DevOps) |
| `editor_volkova` | Editor | Технический редактор |
| `editor_morozov` | Editor | Редактор корпоративных новостей |
| `sokolova_dev` | User | Senior Frontend Developer |
| `nikitin_dev` | User | Backend Developer |
| `lebedeva_qa` | User | QA Engineer |
| `orlov_devops` | User | DevOps Engineer |

`npm run seed` is idempotent — re-running it will not create duplicates.

---

## Testing

```bash
# Unit tests
npm run test

# Unit tests with coverage report
npm run test:cov

# E2E tests
npm run test:e2e

# All tests (unit + E2E)
npm run test:all
```

Unit tests live alongside source files as `*.spec.ts`.
E2E tests are in `test/` as `*.e2e-spec.ts` and test full HTTP request/response cycles using Supertest.
