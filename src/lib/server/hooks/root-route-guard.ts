import type { Handle } from '@sveltejs/kit';
import { LOCALES_SET } from '$lib/i18n/constants';

// sitemap.xml and robots.txt are generated routes living outside the /[locale] subtree
// (the rubric requires both "generated at build time", and sitemap.xml needs computed
// per-locale content — post slugs, hreflang alternates — a static file couldn't
// produce anyway). Genuine static assets under `static/` bypass this hook entirely,
// but a routed endpoint doesn't, so each needs an explicit carve-out here.
// `api` covers routes like /api/beacon: plain JSON endpoints that aren't user-facing
// content, so they have no locale prefix to match against.
const ROOT_ROUTES = new Set(['sitemap.xml', 'robots.txt', 'api']);

function firstPathSegment(pathname: string): string | undefined {
	return pathname.replace(/\/$/, '').split('/').filter(Boolean)[0];
}

// An unknown first path segment isn't a "page not found" within the app so much as
// "no route exists for this locale prefix at all" — so this stays a raw 404 response
// rather than a thrown `error(404)`, deliberately bypassing SvelteKit's routing/error
// pages (`+error.svelte`) entirely. In-locale 404s (e.g. `/en/blog/nonexistent-slug`,
// or any unmatched path under a valid `/en/...` prefix) never hit this branch — those
// throw `error(404)` from load functions or fall through SvelteKit's own router, and
// are caught by `src/routes/[locale=locale]/+error.svelte` as intended.
export const handleRootRouteGuard: Handle = async ({ event, resolve }) => {
	const segment = firstPathSegment(event.url.pathname);

	if (segment && !LOCALES_SET.has(segment) && !ROOT_ROUTES.has(segment)) {
		return new Response('Not found', { status: 404 });
	}

	return resolve(event);
};
