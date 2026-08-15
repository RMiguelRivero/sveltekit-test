# SvelteKit Site

A localized (en/de) marketing site + blog + authenticated dashboard, built for the
demoing. Covers a token-based design system, an
accessible Dialog composite built from scratch, SEO/JSON-LD, dynamic OG images, a
mock-auth login flow with signed session cookies, and a streamed/paginated/sortable
dashboard table with optimistic inline editing.

## Run locally

```sh
npm install
cp .env.example .env   # then fill in SESSION_SECRET (see comment in the file)
npm run dev
```

## Run tests

```sh
npm run test    # unit tests (Vitest) — Dialog composite + business logic
npm run lint     # prettier --check + eslint
npm run check    # svelte-check
```

No Playwright/E2E suite, size-limit budgets, Lighthouse CI, or pre-commit hooks are
set up — see **Known limitations** below.

## Demo credentials

Mock accounts, from `static/mocks/users.json` (plaintext passwords — mock auth only):

| Email            | Password | Role   |
| ---------------- | -------- | ------ |
| admin@demo.test  | demo1234 | admin  |
| editor@demo.test | demo1234 | editor |
| viewer@demo.test | demo1234 | viewer |

`viewer` is read-only on the dashboard items table; `admin`/`editor` can edit item status.

## Deploying

```sh
vercel login
vercel deploy    # or: vercel --prod
```

Set `SESSION_SECRET` in the Vercel project's Environment Variables before deploying —
without it, the app throws on startup in production rather than falling back to the
insecure dev default.

## Architecture decisions

| Route                          | Strategy                  | Runtime      | Why                                                                                                                                                                                                                                                                                   |
| ------------------------------ | ------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/` (landing)                  | Prerendered (SSG)         | —            | Fully static marketing content, no per-request data.                                                                                                                                                                                                                                  |
| `/blog`                        | SSR + ISR (5 min)         | Node default | Query-string-dependent (page/tags/sort); ISR keyed on `allowQuery` caches each combo separately, giving prerender-like CDN caching without the "one static variant for every query string" bug. Search/filter/sort lives here rather than a separate `/search` route, all URL-synced. |
| `/blog/[slug]`                 | SSR + ISR (5 min)         | Node default | Per-slug content doesn't depend on query params, but ISR (not `prerender=true`) lets edited/new mock posts show up on revalidation without a full rebuild.                                                                                                                            |
| `/blog/[slug]/opengraph-image` | SSR, dynamic (@vercel/og) | **Edge**     | Stateless, read-only, fetched globally by social-media crawlers — low cold-start, globally distributed runtime beats a single-region Node function.                                                                                                                                   |
| `/login`                       | SSR                       | **Node**     | State-changing write path (sets an httpOnly session cookie); session signing itself uses Web Crypto so it _would_ run on edge, but pinned to Node for consistency with other write paths and headroom for a future real DB driver.                                                    |
| `/logout`                      | SSR                       | **Node**     | Cookie delete + redirect; pinned to Node for consistency with the other auth mutations, not a hard technical requirement.                                                                                                                                                             |
| `/dashboard/**`                | SSR, never prerendered    | Node default | Authenticated, per-user content; guarded by a layout-server `load` (colocated with the subtree it protects, re-runs for every descendant route for free).                                                                                                                             |
| `/dashboard/items`             | Streamed SSR              | **Node**     | Skeleton renders immediately; row data streams in via an unawaited `itemsPromise` from `load`. Write path (`updateStatus` action) wants consistent single-region execution and headroom for a real DB driver later.                                                                   |
| `/sitemap.xml`, `/robots.txt`  | Prerendered               | —            | Generated at build time, locale-aware.                                                                                                                                                                                                                                                |
