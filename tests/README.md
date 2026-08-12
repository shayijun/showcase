# Testing Strategy

This project follows test-first development. For every product requirement or code change:

1. Write or update the smallest failing test that describes the expected behavior.
2. Implement the code until the focused test passes.
3. Run the relevant local checks before handing off the change.

## Test Layers

- Unit tests: pure functions, domain rules, request helpers, permissions, billing math, credits, and validators.
- Integration tests: API route behavior, model/service contracts, auth/RBAC boundaries, storage/payment/email provider adapters with mocks.
- Component tests: React components with Testing Library. Use `@vitest-environment jsdom` at the top of a test file when DOM APIs are needed.
- E2E tests: Playwright tests for critical user journeys such as signup, login, purchase, subscription status, credit consumption, and AI generation.

## Commands

- `pnpm typecheck`: TypeScript contract check.
- `pnpm lint`: ESLint quality check.
- `pnpm test`: Vitest unit, integration, and component tests.
- `pnpm test:coverage`: Vitest with coverage report.
- `pnpm test:e2e`: Playwright browser tests.
- `pnpm validate`: default local quality gate before committing code.

## AI Guardrails

- Do not mark a change complete if the relevant tests were not written or updated.
- Do not delete or weaken tests to make a run pass unless the product behavior changed and the new behavior is documented.
- Mock external providers in automated tests unless a test is explicitly marked as a manual/live integration check.
- Every new API route must test auth, ownership, invalid input, rate limits where applicable, and the success path.
