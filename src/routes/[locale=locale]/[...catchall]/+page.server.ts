import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Without this, a path that matches no leaf route at all (e.g. `/en/nonexistent`) has
// no route object for SvelteKit to infer a layout chain from, so it falls all the way
// back to the root `+error.svelte` instead of `[locale=locale]/+error.svelte` — even
// though the first segment is a valid locale. This catch-all gives every otherwise
// unmatched in-locale path a route to match, so the error is thrown (and rendered)
// inside the locale layout as intended.
export const load: PageServerLoad = () => {
	throw error(404, { message: 'Page not found' });
};
