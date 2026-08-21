# AGENTS.md

## What this repo is

Single-file npm library (`@darcas/smart-dns-promises`): DNS resolver with caching over `node:dns/promises`, zero runtime dependencies (custom Map-based LRU). All logic lives in `src/index.ts`; tests in `tests/index.test.ts` (Vitest, mocks `node:dns/promises`). No lint config; CI only publishes.

## Commands

```bash
npm test         # vitest run
npm run build    # rm -rf dist && tshy && esbuild minify (CJS + ESM)
npm run deploy   # build && npm publish --access public (normally NOT run locally)
```

There is no lint script.

## Build & publish flow

- Build uses **tshy** to produce dual ESM/CJS output in `dist/`, then esbuild bundles `index.min.js` for the extra `./min` export. Both export maps in `package.json` must stay in sync with the `tshy.exports` block when adding entry points.
- Publishing is automated: pushing a tag `v*` triggers `.github/workflows/publish.yml`, which runs `npm run deploy` on Node 24. To release: bump `version` in `package.json`, commit, tag, push tag. Never publish manually.

## Code conventions

- ESM package (`"type": "module"`) with `NodeNext` resolution — any new file imports need explicit `.js` extensions.
- TypeScript strict, target ESNext, Node engines `20 || >=22`.
- Formatting per `.editorconfig`: 4-space indent, **no semicolons**, spaces inside parentheses/import braces, trailing commas when multiline, max 100 cols. Match existing style in `src/index.ts`.
- Public API surface is deliberate: `SmartDns.factory()` singleton (constructor is `protected`), `DnsProvider` enum, two error classes. Keep JSDoc comments on exported members.

## Gotchas

- `setProvider`/`setServers` call Node's process-global `setServers` from `node:dns/promises`, and `setDefaultResultOrder` is also global — these mutate DNS behavior for the entire process, not just this instance. This is **intentional v1 API compat** (a per-instance `Resolver` would be a v2 breaking change).
- Cache entries expire on the real DNS record TTL (clamped to `minTtl`/`maxTtl` options), falling back to the constructor `ttl` only as configured bound; SWR (`swr: true`) serves expired entries and refreshes in background.
- The `factory()` singleton ignores config passed after the first call — kept for v1 compat.
- Tests mock `node:dns/promises` via `vi.mock`; use `vi.useFakeTimers()` for TTL expiry tests and instantiate fresh instances via a `class TestDns extends SmartDns {}` subclass (constructor is `protected`).
