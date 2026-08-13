import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPostBySlug } from '$lib/server/api';

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug;
	try {
		const post = getPostBySlug(slug);
		if (!post) {
			throw error(404, { message: 'Post not found' });
		}
		console.log('post', post);
		return { post };
	} catch (_err) {
		throw error(500, { message: 'Internal server error' });
	}
};
