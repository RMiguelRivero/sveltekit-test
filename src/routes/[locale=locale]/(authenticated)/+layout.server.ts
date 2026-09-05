import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// Authenticated, per-user content under this whole group — never prerendered.
export const prerender = false;

// A group layout guard (rather than a path-prefix check in the global `handle` hook)
// covers every authenticated route for free via SvelteKit's ancestor-layout re-run,
// and any future authenticated route inherits it automatically just by living under
// this `(authenticated)` group — no per-route wiring to remember.
export const load: LayoutServerLoad = ({ locals, params, url }) => {
	if (!locals.user) {
		throw redirect(303, `/${params.locale}/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	}
	return { user: locals.user };
};
