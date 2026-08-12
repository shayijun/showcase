# AI Project Memory

This is the product codebase for a ShipAny Two based SaaS application. Treat it as a production product, not a throwaway template.

## Non-Negotiable Workflow

- Use test-first development for every new requirement, bug fix, refactor, or API change.
- Start by writing or updating the smallest failing test that captures the intended behavior.
- Implement only enough code to make the test pass, then refactor while keeping tests green.
- Before handing off code, run the relevant checks and report the exact commands and results.
- Never claim a task is done when tests were skipped, blocked, or only assumed to pass.

## Required Quality Gate

For normal code changes, run:

```bash
pnpm validate
```

For narrow changes, at minimum run the focused test plus:

```bash
pnpm typecheck
pnpm lint
```

For UI/user-flow changes, also run or update:

```bash
pnpm test:e2e
```

If a command cannot run because of missing secrets, browser binaries, database access, or third-party service configuration, state the blocker clearly and keep the automated/mocked tests passing.

Use `pnpm lint:full` when you need to inspect the inherited template warning backlog. Do not introduce new warnings in files you edit.

## Testing Expectations

- Unit tests live in `tests/unit/**` or next to source as `*.test.ts`.
- Component tests use Vitest + Testing Library and may opt into jsdom with `@vitest-environment jsdom`.
- E2E tests live in `tests/e2e/**` and use Playwright.
- API tests must cover authentication, authorization/ownership, invalid input, success responses, and rate limits where relevant.
- Payment, email, storage, analytics, and AI provider tests must mock external network calls by default.
- Do not remove, skip, or relax a failing test unless the product requirement changed and the replacement test documents the new behavior.

## Product Safety Rules

- New server endpoints must validate input, enforce auth/RBAC/ownership, avoid SSRF/open proxy behavior, and avoid leaking secrets or internal URLs.
- New user-facing content should keep English and Chinese locale files in sync unless the product intentionally launches one locale first.
- Do not commit secrets, `.env*`, database files, generated coverage, `.next`, `.source`, or local debug artifacts.
- Prefer existing project patterns in `src/shared`, `src/core`, `src/extensions`, and `src/themes/default` before adding new abstractions.

## Useful Commands

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm lint:full
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm validate
```
