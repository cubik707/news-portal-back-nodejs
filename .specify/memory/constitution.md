<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0 (initial ratification)
Added sections:
  - Core Principles (I–V)
  - Security & Authorization
  - Observability
  - Governance
Modified principles: n/a (initial)
Removed sections: n/a (initial)
Templates requiring updates: n/a (initial constitution)
Deferred TODOs: none
-->

# News Portal Constitution

## Core Principles

### I. Clean Architecture

All code MUST respect the four-layer boundary: Core → Application → Infrastructure → Presentation.

- Controllers MUST NOT contain business logic — they receive a request, delegate to a use case, and return a response. No exceptions.
- Business logic lives exclusively in the Core (domain entities, value objects) and Application (use cases) layers.
- Infrastructure adapters MUST implement interfaces defined in Core; the domain layer MUST NOT import any framework, ORM, or external library.
- For the frontend (React): UI components handle rendering only; data-fetching and state logic belong in dedicated service or hook layers — not inside components.

**Rationale:** Layer violations create tight coupling that makes the system resistant to change and impossible to test in isolation.

### II. Domain-Driven Design

Model the business domain explicitly in code.

- Entities carry identity and enforce their own invariants; Value Objects are immutable and compared by value.
- Each bounded context (Auth, News, Users, Categories, Tags, Subscriptions) owns its domain model and declares its own repository interface in Core.
- Every business operation is encapsulated in a dedicated Use Case class with a single `execute()` method — no shared catch-all services.
- Class, method, and variable names MUST reflect the ubiquitous language of the domain.

**Rationale:** An explicit domain model keeps business rules visible and co-located rather than scattered across controllers and services.

### III. SOLID + OOP

Every class and module MUST follow SOLID principles.

- **Single Responsibility** — one reason to change per class.
- **Open/Closed** — extend via new classes or ports, not by modifying stable code.
- **Liskov Substitution** — implementations MUST be fully substitutable for their declared interfaces.
- **Interface Segregation** — prefer narrow, role-specific interfaces over fat ones.
- **Dependency Inversion** — high-level modules depend on abstractions (interfaces in Core), never on concrete infrastructure classes.

**Rationale:** SOLID violations are the root cause of most maintenance debt; in a growing codebase they compound fast.

### IV. DRY + YAGNI — Simplicity First

- Do NOT abstract until the third duplication (Rule of Three).
- Do NOT build for hypothetical future requirements — implement exactly what is needed now.
- Shared business rules MUST live in a single authoritative location; copy-pasted logic is a hard blocker in review.
- Prefer deleting code over adding it when a simpler solution exists.

**Rationale:** Premature abstraction and speculative generality increase cognitive load without delivering value — especially harmful on a solo project.

### V. Pragmatic Testing

- Integration tests are the primary safety net. Write them for all critical user flows: authentication, news lifecycle, approval workflow, role-based access.
- Unit tests are reserved for complex or pure logic that is difficult to cover through integration tests alone (e.g., domain entity invariants, non-trivial utility functions).
- Tests MUST NOT be written solely to hit a coverage number.
- Integration tests hit the full HTTP layer (Supertest) against a real database — no mocks of infrastructure unless unavoidable.

**Rationale:** Integration tests catch real breakage across layers. Unit tests on trivial code add maintenance burden without proportional safety.

## Security & Authorization

- Every protected endpoint MUST be covered by the appropriate guard(s): `JwtAuthGuard`, `ApprovedGuard`, `RolesGuard`.
- Passwords MUST be hashed with bcrypt (minimum 10 rounds); plain-text passwords MUST never be stored or logged.
- JWT secrets and all credentials MUST be loaded from environment variables — hardcoding is never acceptable.
- Role and approval checks MUST be enforced server-side; any client-side hiding is cosmetic and carries no security weight.

## Observability

- Significant application events MUST be logged via Pino at the appropriate level (`info`, `warn`, `error`).
- HTTP request/response pairs are logged automatically by the global middleware — do not duplicate this in controllers or use cases.
- Sensitive data (passwords, raw tokens) MUST never appear in logs.
- Production logs MUST be structured JSON; development logs MAY use human-readable pino-pretty output.

## Governance

This constitution is the authoritative source of non-negotiable engineering rules for the News Portal project — covering the NestJS backend and the React frontend. It supersedes any conflicting convention found elsewhere in the codebase or documentation.

**Amendment procedure:** Amend freely as sole developer. Update this file and set `Last Amended` to the date of the change whenever a principle is added, changed, or removed.

**Compliance:** Every commit introducing a new feature or significant refactoring MUST be checked against these principles before it is considered complete.

**Ratified**: 2026-03-24 | **Last Amended**: 2026-03-24
