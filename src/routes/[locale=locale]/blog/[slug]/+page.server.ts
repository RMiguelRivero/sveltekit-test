import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPostBySlug } from '$lib/server/api';

// A single slug's content doesn't depend on query params, so this route stays
// prerender-friendly per-slug — but ISR (rather than pure `prerender = true`) lets
// edited/new mock posts show up on revalidation instead of requiring a full rebuild.
export const prerender = false;

export const config = {
	isr: { expiration: 300 },
};

export const load: PageServerLoad = async ({ params, url }) => {
	const slug = params.slug;
	let post;
	try {
		post = getPostBySlug(slug);
	} catch (_err) {
		throw error(500, { message: 'Internal server error' });
	}
	if (!post) {
		throw error(404, { message: 'Post not found' });
	}
	return { post, origin: url.origin };
};
