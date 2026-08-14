import { LOCALES_SET } from '$lib/i18n/constants';
import { getUsers } from '$lib/server/api';
import { SESSION_COOKIE_NAME } from '$lib/server/auth/auth.constants';
import { verifySessionCookieValue } from '$lib/server/auth/session';
import type { Handle } from '@sveltejs/kit';

// sitemap.xml is a generated route living outside the /[locale] subtree (it needs
// computed per-locale content — post slugs, hreflang alternates — so it can't be a
// static file the way robots.txt is). Everything else under `static/` bypasses this
// hook entirely, but a routed endpoint doesn't, so it needs an explicit carve-out.
const ROOT_ROUTES = new Set(['sitemap.xml']);

export const handle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;

	const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean);
	const locale = segments[0];

	// An unknown first path segment isn't a "page not found" within the app so much as
	// "no route exists for this locale prefix at all" — so this stays a raw 404 response
	// rather than a thrown `error(404)`, deliberately bypassing SvelteKit's routing/error
	// pages (`+error.svelte`) entirely. In-locale 404s (e.g. `/en/blog/nonexistent-slug`,
	// or any unmatched path under a valid `/en/...` prefix) never hit this branch — those
	// throw `error(404)` from load functions or fall through SvelteKit's own router, and
	// are caught by `src/routes/[locale=locale]/+error.svelte` as intended.
	if (segments.length > 0 && !LOCALES_SET.has(locale) && !ROOT_ROUTES.has(locale)) {
		return new Response('Not found', { status: 404 });
	}

	event.locals.user = await resolveSessionUser(event.cookies.get(SESSION_COOKIE_NAME));
	if (!event.locals.user && event.cookies.get(SESSION_COOKIE_NAME)) {
		event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
	}

	return resolve(event);
};

async function resolveSessionUser(cookieValue: string | undefined): Promise<App.Locals['user']> {
	if (!cookieValue) {
		return null;
	}
	const session = verifySessionCookieValue(cookieValue);
	if (!session) {
		return null;
	}
	const user = (await getUsers()).find((candidate) => candidate.id === session.id);
	if (!user) {
		return null;
	}
	const { password: _password, ...sessionUser } = user;
	return sessionUser;
}
