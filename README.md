# SvelteKit Site

A localized (en/de) marketing site + blog + authenticated dashboard, built for the
demoing. Covers a token-based design system, an
accessible Dialog composite built from scratch, SEO/JSON-LD, dynamic OG images, a
mock-auth login flow with signed session cookies, and a streamed/paginated/sortable
dashboard table with optimistic inline editing and an admin-only full-detail edit
dialog (animated, responsive down to a mobile bottom sheet).

## Run locally

```sh
npm install
cp .env.example .env   # then fill in SESSION_SECRET (see comment in the file)
npm run dev
```

## Run tests

```sh
npm run test               # unit tests (Vitest) — Dialog composite + business logic
npm run test:e2e           # Playwright E2E — builds, serves the preview build, runs the suite
npm run lint                # prettier --check + eslint
npm run check                # svelte-check
npm run size-limit          # JS bundle size budgets
npm run lighthouse          # Lighthouse CI — public surface (landing/blog/blog post)
npm run lighthouse:dashboard # Lighthouse CI — authenticated dashboard
```

`test:e2e` and the Lighthouse commands need Chromium installed once via
`npx playwright install chromium`. A Husky pre-commit hook runs `lint-staged` (fast,
staged-files-only formatting/lint) on every commit — the full `check`/`test` suite is
deliberately left to CI rather than run locally on every commit, since `svelte-check` is
too slow for that.

### E2E flows (Playwright, `e2e/`)

- **Anonymous search → post** (`anonymous-search.spec.ts`): visits `/blog`, types a
  query into the search box (URL-synced via `q`, debounced), asserts the filtered
  result list, clicks through to the post, and asserts the detail page renders. Search
  lives on `/blog` itself rather than a separate `/search` route — see the "why" in
  `blog/+page.server.ts`.
- **Authenticated dashboard edit + rollback** (`dashboard-optimistic-edit.spec.ts`):
  logs in via the real `/login` form, edits a campaign's status on
  `/dashboard/items` and confirms the optimistic update persists across a reload, then
  edits the deterministic failure sentinel (`cmp_0001`) and confirms the optimistic
  update rolls back to its previous value with an error toast once the server rejects
  it — the single most load-bearing assertion in the suite.
- **Accessibility** (`a11y.spec.ts`): runs axe against `/dashboard/items` once the
  streamed rows have resolved, and fails on any `serious`/`critical` violation.
- **Visual regression** (`visual.spec.ts`): snapshots the landing page hero
  (`e2e/visual.spec.ts-snapshots/`), a static, animation-free target chosen to keep the
  baseline stable.

## Demo credentials

Mock accounts, from `static/mocks/users.json` (plaintext passwords — mock auth only):

| Email            | Password | Role   |
| ---------------- | -------- | ------ |
| admin@demo.test  | demo1234 | admin  |
| editor@demo.test | demo1234 | editor |
| viewer@demo.test | demo1234 | viewer |

`viewer` is read-only on the dashboard items table; `admin`/`editor` can edit item
status inline; `admin` additionally gets a pencil-icon "Edit" column opening a dialog
to edit a campaign's name, status, channel, budget, spent, and CTR, validated against
the same item schema and saved with the same optimistic-update/rollback behavior.

## Deploying

```sh
vercel login
vercel deploy    # or: vercel --prod
```

Set `SESSION_SECRET` in the Vercel project's Environment Variables before deploying —
without it, the app throws on startup in production rather than falling back to the
insecure dev default.

## Architecture decisions

| Route                          | Strategy                  | Runtime      | Why                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------ | ------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/` (landing)                  | Prerendered (SSG)         | —            | Fully static marketing content, no per-request data.                                                                                                                                                                                                                                                                                                                                                                                        |
| `/blog`                        | SSR + ISR (5 min)         | Node default | Query-string-dependent (page/tags/sort); ISR keyed on `allowQuery` caches each combo separately, giving prerender-like CDN caching without the "one static variant for every query string" bug. Search/sort and a dedicated tag-filter control (listing every tag, not just ones on the current page) all live here rather than a separate `/search` route, fully URL-synced.                                                               |
| `/blog/[slug]`                 | Prerendered (`'auto'`)    | —            | Every known post × locale is baked into a real static file at build time via an `entries()` generator (no function invocation on request); `'auto'` (not `true`) keeps the route in the dynamic SSR manifest too, so a slug added after the last build still resolves via SSR instead of 404ing. Trade-off vs. the prior ISR setup: an _edited_ post stays frozen at its build-time content until the next deploy — no revalidation window. |
| `/blog/[slug]/opengraph-image` | SSR, dynamic (@vercel/og) | **Node**     | Originally edge (stateless/read-only/crawler-fetched), but `@vercel/og`'s edge build fetches its fallback font as a blob asset Vercel can't resolve outside Next.js's build, which fails deployment. Moved to Node, which loads the same font via `fs.readFileSync` instead — also matches Vercel deprecating Edge Functions platform-wide in favor of Fluid Compute on Node.                                                               |
| `/login`                       | SSR                       | **Node**     | State-changing write path (sets an httpOnly session cookie); session signing itself uses Web Crypto so it _would_ run on edge, but pinned to Node for consistency with other write paths and headroom for a future real DB driver.                                                                                                                                                                                                          |
| `/logout`                      | SSR                       | **Edge**     | Cookie delete + redirect, no data lookups or writes; the hook chain it runs through (translations/locale/auth) is already edge-safe (statically-imported mock data, Web Crypto session verification).                                                                                                                                                                                                                                       |
| `/dashboard/**`                | SSR, never prerendered    | Node default | Authenticated, per-user content; guarded by a layout-server `load` (colocated with the subtree it protects, re-runs for every descendant route for free).                                                                                                                                                                                                                                                                                   |
| `/dashboard/items`             | Streamed SSR              | **Node**     | Skeleton renders immediately; row data streams in via an unawaited `itemsPromise` from `load`. Write paths (`updateStatus`, and the admin-only `updateItem` full-detail action) want consistent single-region execution and headroom for a real DB driver later.                                                                                                                                                                            |
| `/sitemap.xml`, `/robots.txt`  | Prerendered               | —            | Generated at build time, locale-aware.                                                                                                                                                                                                                                                                                                                                                                                                      |
| `/404`, `[...catchall]` routes | SSR, always redirects     | Node default | Every unmatched path — a valid-locale path with no matching leaf route, or a path with no valid locale prefix at all (e.g. `/xyz`) — redirects into one dedicated `/{locale}/404` route rather than throwing inline or returning a raw hook-level response, so `/404` is directly reachable and every not-found case renders the same styled, chrome-free error page.                                                                       |

## Known limitations / deliberate cuts

- **In-memory items store** (`src/lib/server/api/items.ts`): mutations live in a
  module-scope array seeded from `static/mocks/items.json`. This resets on server
  restart, and on serverless platforms like Vercel each function instance gets its own
  copy — a write from one invocation isn't guaranteed visible from another. A real
  deployment needs an actual database here.
- **Mock auth**: `static/mocks/users.json` stores plaintext passwords and there's no
  real user store or signup flow. A real system would hash+compare (bcrypt/argon2) and
  never store plaintext.
- **No `vercel.json`**: everything needed (ISR, edge/node runtime split) is expressible
  via adapter-vercel's inline `export const config` per route, so a separate config file
  would be redundant.
- **Lighthouse CI's dashboard coverage is intentionally narrower** than the public
  surface (`lighthouserc.dashboard.json` vs. `lighthouserc.json`): it asserts only one
  authenticated URL (`/dashboard/items`, one locale), not the 3-URL public spread, and
  turns the `seo` category assertion off entirely rather than gating on it. The
  dashboard is `noindex` with no meta description by design (private, authenticated
  content) — those are exactly what a `seo ≥ 0.95` gate would flag as "wrong," so
  enforcing it there would mean regressing real SEO/security hygiene just to satisfy a
  score. SEO stays enforced at ≥0.95 on the public surface, where it's a real signal.
- **`/blog/[slug]` trades revalidation for speed**: it moved from SSR+ISR to
  `prerender = 'auto'` with a build-time `entries()` list, so every known post is a real
  static file (no function invocation) instead of an ISR-cached response. New posts
  (not in `entries()` at build time) still work via SSR fallback, but an _edited_
  existing post won't reflect the edit until the next `vercel deploy` — ISR's 5-minute
  revalidation window is gone for this route. Chosen deliberately for a mostly-static
  content site where deploys are the natural point to pick up content changes anyway.
- **The OG image route moved off `edge` onto Node** after an actual `vercel deploy`
  failed with `referencing unsupported modules: vc-blob-asset:...Geist-Regular.ttf`.
  `@vercel/og`'s edge build unconditionally fetches its fallback font as a blob asset
  that only resolves inside Next.js's own build, so it can't deploy outside Next; the
  Node build loads the same font via `fs.readFileSync` instead, which works. This also
  matches Vercel's own direction — per
  [sveltejs/kit#14253](https://github.com/sveltejs/kit/pull/14253), Edge Functions are
  "essentially deprecated" platform-wide in favor of Fluid Compute on Node.js. That
  leaves `/logout` as the project's one real edge route: a trivial cookie-delete +
  redirect through an already edge-safe hook chain, with no technical blocker like
  the OG route's. It satisfies the edge/Node split requirement without pretending
  the OG image route's Node move was anything but a real deployment constraint.
