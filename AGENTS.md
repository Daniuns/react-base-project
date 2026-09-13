# Instructions for AI coding agents

This file is the operational source of truth for AI-assisted changes in this repository. Read it completely before editing code.

Also consult:

- `README.md` for setup, scripts, and environment variables.
- `docs/architecture.md` for architectural decisions and flow descriptions.
- `package.json` for the actual dependency versions and available commands.

If documentation and code disagree, do not silently guess. Prefer the current working implementation, flag the discrepancy, and update the documentation when the task authorizes that change.

## Package manager and runtime

- Use the Node version declared in `.node-version`.
- Use the pnpm version declared in `package.json` through Corepack.
- Do not create `package-lock.json` or `yarn.lock`.
- Use `corepack pnpm <command>` when a pnpm shim is not available.
- Do not upgrade dependencies unless the task requires it. Keep `pnpm-lock.yaml` synchronized with `package.json`.

## Project structure

Organize domain code by feature:

```text
src/features/<feature>/
├── api/          HTTP functions, schemas, and domain types
├── queries/      TanStack Query keys, options, and read hooks
└── mutations/    write hooks and cache synchronization
```

- Pages belong in `src/Pages` and should compose feature hooks and UI.
- Shared, domain-independent UI belongs in `src/components`.
- shadcn components belong in `src/components/ui`.
- Cross-cutting helpers and configuration belong in `src/lib`.
- HTTP client configuration belongs in `src/services`.
- Do not put React hooks inside service or API modules.
- Do not create a global folder organized only by HTTP verbs.

## TypeScript and imports

- Keep strict TypeScript enabled. Do not weaken compiler or lint rules to make a change pass.
- Avoid `any`, non-null assertions, and unchecked type casts. Narrow unknown data instead.
- Use `import type` for type-only imports.
- Prefer the `@/` alias for imports across directories and relative imports within the same feature area.
- Export domain types from the schema that defines them when practical.
- Validate environment variables in `src/settings.ts`.
- Never expose secrets through `VITE_*` variables; they are included in the browser bundle.

## External data and HTTP

Use the client matching the endpoint:

| Client         | Responsibility                                         |
| -------------- | ------------------------------------------------------ |
| `api`          | Authenticated application-backend requests             |
| `noAuthApi`    | Login and unauthenticated application-backend requests |
| `exampleApi`   | Public GitHub demonstration requests                   |
| `tibiaWikiApi` | TibiaWiki requests through `/tibiawiki-api`            |

- Never use `api` for public endpoints; its request interceptor requires a session.
- Never add authentication headers or refresh interceptors to public clients.
- Set a finite timeout on new Axios clients and disallow absolute URL overrides.
- Accept an optional `AbortSignal` in read functions and pass the signal from TanStack Query to Axios.
- Treat every external payload as `unknown` and parse it with Zod before returning it to the UI.
- Normalize transport-specific field names and primitive formats in the API/schema layer, not in components.
- The TibiaWiki service does not allow direct browser CORS. Keep the development proxy in `vite.config.ts`; production hosting needs an equivalent reverse-proxy rule.

## Authentication invariants

The refresh implementation in `src/services/api.ts` is security-sensitive.

- Concurrent requests must share one in-flight refresh operation.
- A refreshed token must release all waiting requests.
- Refresh failure must clear both tokens and notify session expiration once.
- A request may be replayed after `401` at most once.
- Simultaneous `401` responses must not cause sequential duplicate refreshes.
- Preserve refresh-token rotation when the server returns a new refresh token.
- Opaque access tokens rely on `401`; JWT access tokens may be checked through `exp` with clock skew.
- Signing out must clear authenticated TanStack Query data.
- Keep token storage behind the `TokenStorage` interface so a future BFF or cookie-based strategy can replace it.
- Any change to this flow requires focused concurrency and failure tests.

## TanStack Query conventions

- Define query keys with a feature-local key factory.
- Prefer reusable `queryOptions` functions and thin hooks around `useQuery`.
- Keep read hooks in `queries/` and write hooks in `mutations/`.
- Enable dependent queries only when all required parameters exist.
- After a mutation, update or invalidate the precise related query keys.
- Do not copy server data into local component state unless the user is editing a draft.
- Pages must explicitly handle pending, error, empty, success, and background-fetch states where relevant.

## React and routing

- Use function components and hooks.
- Do not call hooks conditionally or from regular functions.
- Lazy-load route-level pages in `src/Router/appRouter.tsx`.
- Protect private routes with `ProtectedRoute`; do not duplicate token checks inside pages.
- Preserve the requested destination when redirecting anonymous users to login.
- Prefer semantic HTML, visible keyboard focus, associated labels, and appropriate ARIA state.
- Avoid effects for state that can be derived during rendering or changed directly in an event handler.

## UI and shadcn

- Reuse existing components from `src/components/ui` before introducing a new primitive.
- Add new shadcn components with the configured shadcn CLI so they match `components.json`.
- shadcn files are source-owned: inspect existing customizations before updating or overwriting them.
- Use Tailwind design tokens such as `bg-background`, `text-muted-foreground`, and `border-border` instead of hard-coded theme colors.
- New screens must work at mobile and desktop widths.
- Do not add a UI library that overlaps with shadcn/Base UI without an explicit architectural reason.

## Tests

- Use Vitest and Testing Library for unit and integration tests.
- Use MSW at the HTTP boundary instead of mocking Axios internals.
- Use `userEvent` for user interactions.
- Tests must cover observable behavior, not implementation details.
- Keep Playwright tests in `e2e/`; Vitest must not collect them.
- Do not make CI E2E tests depend on live third-party services. Intercept those requests or use deterministic fixtures.
- Add regression tests for bug fixes and focused tests for new data transformations or interactions.

## Scope and repository safety

- Preserve unrelated user changes in the working tree.
- Do not delete, reset, or rewrite files outside the requested scope.
- Do not commit, push, or open a pull request unless explicitly requested.
- Do not edit `.env` or expose its contents. Update `.env.example` when adding public configuration.
- Do not edit generated output such as `dist`, `coverage`, `playwright-report`, or `test-results`.
- Keep documentation synchronized when a change alters setup, environment variables, public scripts, or architecture.

## Definition of done

Before handing off a code change, run:

```bash
corepack pnpm format
corepack pnpm check
```

Run `corepack pnpm e2e` when changing routes, navigation, authentication behavior, or a critical user flow. If a required check cannot run, state exactly which check was skipped and why.

A change is complete only when:

- the requested behavior is implemented;
- external data is validated;
- loading, failure, and empty states are covered where applicable;
- relevant tests are added or updated;
- lint, typecheck, tests, and production build pass;
- configuration and documentation remain accurate.
