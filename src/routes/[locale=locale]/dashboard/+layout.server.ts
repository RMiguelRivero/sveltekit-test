import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// Authenticated, per-user content under this whole subtree — never prerendered.
export const prerender = false;

// A layout guard (rather than a path-prefix check in the global `handle` hook) keeps
// the auth check colocated with the routes it protects. SvelteKit re-runs every
// ancestor layout `load` for each descendant route, so this guard covers the entire
// `dashboard/**` subtree for free. It's also simpler to extend per-route later (e.g.
// role-based checks on a specific child route) than a hook, which would need its own
// path-matching logic mixed into global request handling.
export const load: LayoutServerLoad = ({ locals, params, url }) => {
	if (!locals.user) {
		throw redirect(303, `/${params.locale}/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	}
	return { user: locals.user };
};
