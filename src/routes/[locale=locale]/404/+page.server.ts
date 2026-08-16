import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Dedicated route so `/404` is directly reachable (per brief), rendering the same
// `[locale=locale]/+error.svelte` not-found UI that `[...catchall]` falls back to
// for any other unmatched path.
export const load: PageServerLoad = () => {
	throw error(404, { message: 'Page not found' });
};
