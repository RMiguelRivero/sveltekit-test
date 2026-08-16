import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import { toPathname } from '$lib/utils/toPathname';
import { DEFAULT_LOCALE } from '$lib/i18n/constants';

// A first path segment that isn't a valid locale (e.g. `/xyz`, `/foo/bar`) matches
// no route at all — not even `[locale=locale]/[...catchall]`, since its `locale`
// param matcher rejects it — so SvelteKit would otherwise return its bare built-in
// "Not found" text response instead of the app's styled error page. This root-level
// catch-all gives those paths a route to match, redirecting into the default locale's
// dedicated `/404` route.
export const load: PageServerLoad = () => {
	redirect(307, resolve(toPathname(`/${DEFAULT_LOCALE}/404`)));
};
