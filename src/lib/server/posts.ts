import type { Locale, Post } from '$lib/schemas';
import { matchesSearchQuery } from '$lib/utils/matchesSearchQuery';

const POSTS_PER_PAGE = 10;

type PaginatedPosts = {
	posts: Post[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

type LoadPostsOptions = {
	allPosts: Post[];
	locale: Locale;
	page?: number;
	tags?: string[];
	sort?: 'date-desc' | 'date-asc';
	q?: string;
};

export function loadPosts(options: LoadPostsOptions): PaginatedPosts {
	const { allPosts, locale, page = 1, tags = [], sort = 'date-desc', q = '' } = options;

	let filtered = allPosts;

	// Filter by tags if provided
	if (tags.length > 0) {
		filtered = filtered.filter((post) => tags.some((tag) => post.tags.includes(tag)));
	}

	// Free-text search over the localized title/excerpt
	if (q.trim()) {
		filtered = filtered.filter((post) => matchesSearchQuery(post, locale, q));
	}

	// Sort posts
	if (sort === 'date-asc') {
		filtered.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
	} else {
		filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
	}

	const total = filtered.length;
	const totalPages = Math.ceil(total / POSTS_PER_PAGE);
	const start = (page - 1) * POSTS_PER_PAGE;
	const end = start + POSTS_PER_PAGE;

	return {
		posts: filtered.slice(start, end),
		total,
		page,
		pageSize: POSTS_PER_PAGE,
		totalPages,
	};
}
