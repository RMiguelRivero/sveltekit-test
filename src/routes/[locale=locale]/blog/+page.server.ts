import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPosts } from '$lib/server/api';
import { loadPosts } from '$lib/server/posts';

// This route reads page/tags/sort from the query string and returns a different
// payload per combination, so it can't be prerendered as static HTML: prerender is
// resolved per pathname at build time (whichever single variant the crawler hits,
// typically the bare URL with no params) and the resulting static file would then be
// served for every query-string variant of that same pathname — silently wrong for
// filtered/sorted/paginated requests.
export const prerender = false;

// Page-number pagination (not infinite scroll / cursor) is fully SSR-able with no
// client-side fetch-on-scroll, gives every page a stable/shareable/crawlable URL
// (good for SEO on a blog index), and stays trivially URL-synced per the assignment's
// own requirement.
//
// ISR gets us prerender-like CDN caching without prerender's bug: `allowQuery` makes
// Vercel key the cache per allowed query param combination (instead of per pathname
// only), so `/blog`, `/blog?tags=engineering`, `/blog?page=2` etc. are each generated
// once and cached/revalidated independently every 5 minutes, rather than one variant's
// output leaking into the others. No typed adapter-vercel import yet (adapter lands in
// step 20) — this plain object is a no-op until then.
export const config = {
	isr: { expiration: 300, allowQuery: ['page', 'tags', 'sort'] },
};

export const load: PageServerLoad = async ({ url, params }) => {
	const locale = params.locale;

	// Get query params
	const searchParams = url.searchParams as URLSearchParams;
	const page = parseInt(searchParams.get('page') || '1', 10);
	const tagsParam = searchParams.get('tags');
	const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : [];
	const sort = (searchParams.get('sort') as 'date-desc' | 'date-asc') || 'date-desc';

	try {
		const posts = await getPosts();

		const paginatedData = loadPosts({
			allPosts: posts,
			page: Math.max(1, page),
			tags,
			sort,
		});

		return {
			paginatedPosts: paginatedData,
			locale,
			origin: url.origin,
			currentPage: page,
			currentTags: tags,
			currentSort: sort,
		};
	} catch (_err) {
		throw error(500, { message: 'Failed to load posts' });
	}
};
