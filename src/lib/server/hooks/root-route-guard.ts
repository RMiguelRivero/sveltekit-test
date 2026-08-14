import type { Handle } from '@sveltejs/kit';
import { LOCALES_SET } from '$lib/i18n/constants';

// sitemap.xml is a generated route living outside the /[locale] subtree (it needs
// computed per-locale content — post slugs, hreflang alternates — so it can't be a
// static file the way robots.txt is). Everything else under `static/` bypasses this
// hook entirely, but a routed endpoint doesn't, so it needs an explicit carve-out.
const ROOT_ROUTES = new Set(['sitemap.xml']);

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
