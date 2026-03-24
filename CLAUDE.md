## Backend — NestJS API

Every new feature implementation must include a corresponding update to README.md (or relevant documentation files) to reflect usage, configuration changes, or new dependencies.

## Active Feature

**001-news-comments** — Comments on news articles
- Spec: `specs/001-news-comments/spec.md`
- Plan: `specs/001-news-comments/plan.md`
- New bounded context: `src/core/domain/comment/`
- New module: `src/presentation/comments/`
- DB: adds `comments` table (UUID PK, `edited_at` nullable)
