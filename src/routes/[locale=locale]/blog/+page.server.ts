import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getValidatedPosts } from '$lib/server/api';
import { loadPosts } from '$lib/server/posts';

export const prerender = true;
export const load: PageServerLoad = async ({ url, params }) => {
	const locale = params.locale;

	// Get query params
	const searchParams = url.searchParams as URLSearchParams;
	const page = parseInt(searchParams.get('page') || '1', 10);
	const tagsParam = searchParams.get('tags');
	const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : [];
	const sort = (searchParams.get('sort') as 'date-desc' | 'date-asc') || 'date-desc';

	try {
		const posts = getValidatedPosts();

		const paginatedData = loadPosts({
			allPosts: posts,
			page: Math.max(1, page),
			tags,
			sort,
		});

		return {
			paginatedPosts: paginatedData,
			locale,
			currentPage: page,
			currentTags: tags,
			currentSort: sort,
		};
	} catch (_err) {
		throw error(500, { message: 'Failed to load posts' });
	}
};
