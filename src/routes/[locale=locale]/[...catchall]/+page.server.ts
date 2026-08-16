import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import { toPathname } from '$lib/utils/toPathname';

// Without this, a path that matches no leaf route at all (e.g. `/en/nonexistent`) has
// no route object for SvelteKit to infer a layout chain from, so it falls all the way
// back to the root `+error.svelte` instead of `[locale=locale]/+error.svelte` — even
// though the first segment is a valid locale. This catch-all gives every otherwise
// unmatched in-locale path a route to match, redirecting to the dedicated `/404` route
// (which renders that same locale `+error.svelte`).
export const load: PageServerLoad = ({ params }) => {
	redirect(307, resolve(toPathname(`/${params.locale}/404`)));
};
