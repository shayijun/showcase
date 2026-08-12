# ShipAny Template Two SaaS Product

This repository is the product codebase for a ShipAny Two based SaaS application.

## Getting Started

Read the official ShipAny docs before making framework-level changes:

- Chinese docs: https://docs.shipany.ai/zh
- Quick start: https://docs.shipany.ai/zh/shipany-two/quick-start

Common local commands:

```bash
pnpm install
pnpm dev
```

## AI Development Rules

AI assistants must read `AGENTS.md` before changing code in this repository.

Every new requirement, bug fix, refactor, or API change must follow test-first development:

1. Write or update the failing test first.
2. Implement the smallest production change that makes the test pass.
3. Refactor only while tests stay green.
4. Run the relevant automated checks and report the commands/results.

Do not mark a change complete if tests were skipped or only assumed to pass.

## Automated Testing

The default quality gate is:

```bash
pnpm validate
```

It runs:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test:coverage`

Additional test commands:

- `pnpm test`: run Vitest unit, integration, and component tests.
- `pnpm test:watch`: run Vitest in watch mode.
- `pnpm lint:full`: show the inherited template lint warning backlog.
- `pnpm test:e2e`: run Playwright browser tests.
- `pnpm test:e2e:ui`: open the Playwright UI runner.

Test structure:

- `tests/unit/**`: unit and focused integration tests.
- `tests/e2e/**`: Playwright browser flows.
- `tests/setup/vitest.setup.ts`: shared Vitest setup.

For new API routes, tests should cover authentication, ownership/RBAC, invalid input, success behavior, and rate limiting where applicable. External services such as AI providers, payment, email, storage, and analytics should be mocked in automated tests by default.

## LICENSE

!!! Please do not publicly release ShipAny's Code. Illegal use will be prosecuted

[ShipAny LICENSE](./LICENSE)
