# News Portal — Backend (Node.js)

A RESTful API for a news portal built with **NestJS**, **TypeORM**, and **PostgreSQL**. The service handles authentication, news management, categories, tags, file uploads, and user subscriptions.

## Table of Contents

- [Architecture](#architecture)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
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
# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/news_portal

# Secret used to sign JWT tokens
JWT_SECRET=your_jwt_secret

# Gmail credentials for sending emails (use an App Password)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# Directory for uploaded files (relative or absolute path)
UPLOAD_DIR=./uploads

# Application environment
NODE_ENV=development
```

---

## Running the Project

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+ (running and accessible via `DATABASE_URL`)

### Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL, JWT secret, etc.
   ```

3. **Run in development mode** (auto-restart on changes):
   ```bash
   npm run start:dev
   ```

4. **Or build and run in production mode:**
   ```bash
   npm run build
   npm run start
   ```

The server starts on **port 8080**.
Database migrations run automatically on startup (`migrationsRun: true`).

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
