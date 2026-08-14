import type { LayoutServerLoad } from './$types';

// Reads `params.locale` (via the return value) so SvelteKit tracks it as a load
// dependency — without that, a client-side locale switch (`goto`) wouldn't be seen
// as changing this load's inputs, and the stale `locals.translations` from the
// previous locale would be reused instead of hitting the server again.
export const load: LayoutServerLoad = ({ locals, params }) => {
	return { user: locals.user, translations: locals.translations, locale: params.locale };
};
