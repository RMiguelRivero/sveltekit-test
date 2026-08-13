import { LOCALES } from '$lib/i18n/constants';
import type { EntryGenerator, PageServerLoad } from './$types';

// Fully static marketing content with no per-request data — safe to prerender
// for CDN-level caching and zero server compute per request.
export const prerender = true;

export const entries: EntryGenerator = () => LOCALES.map((locale) => ({ locale }));

export const load: PageServerLoad = ({ url }) => {
	return { origin: url.origin };
};
