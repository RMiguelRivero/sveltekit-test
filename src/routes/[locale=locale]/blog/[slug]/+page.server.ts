import type { EntryGenerator, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPost, getPosts } from '$lib/server/api';
import { LOCALES } from '$lib/i18n/constants';

// 'auto' (not `true`): every known post × locale combo below is baked into a real
// static file at build time (no function invocation, fastest possible response), but
// the route stays in the dynamic SSR manifest too — a slug added after the last build
// still resolves via normal SSR instead of 404ing until the next deploy. Trade-off vs.
// the previous ISR setup: a post *edited* after being prerendered stays frozen at its
// build-time content (no revalidation window), so content edits need a rebuild again.
export const prerender = 'auto';

export const entries: EntryGenerator = async () => {
	const posts = await getPosts();
	return LOCALES.flatMap((locale) => posts.map((post) => ({ locale, slug: post.slug })));
};

export const load: PageServerLoad = async ({ params, url }) => {
	const slug = params.slug;
	let post;
	try {
		post = await getPost(slug);
	} catch (_err) {
		throw error(500, { message: 'Internal server error' });
	}
	if (!post) {
		throw error(404, { message: 'Post not found' });
	}
	return { post, origin: url.origin };
};
