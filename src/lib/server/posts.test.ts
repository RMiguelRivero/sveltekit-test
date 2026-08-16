import { describe, expect, it } from 'vitest';
import { loadPosts } from './posts';
import type { Post } from '$lib/schemas';

function makePost(overrides: Partial<Post>): Post {
	return {
		id: 'post_default',
		slug: 'default-post',
		translations: {
			en: { title: 'Default title', excerpt: 'Default excerpt', body: 'Body' },
			de: { title: 'Standardtitel', excerpt: 'Standardauszug', body: 'Text' },
		},
		tags: [],
		author: { id: 'u_1', name: 'Author', avatarColor: '#123456' },
		publishedAt: '2026-01-01T00:00:00Z',
		readingTimeMinutes: 5,
		coverColor: '#654321',
		...overrides,
	};
}

const posts: Post[] = [
	makePost({ id: 'p1', publishedAt: '2026-01-01T00:00:00Z', tags: ['performance'] }),
	makePost({
		id: 'p2',
		publishedAt: '2026-03-01T00:00:00Z',
		tags: ['engineering'],
		translations: {
			en: { title: 'A pragmatic design token system', excerpt: 'Tokens.', body: '' },
			de: { title: 'Ein pragmatisches Design-Token-System', excerpt: 'Tokens.', body: '' },
		},
	}),
	makePost({ id: 'p3', publishedAt: '2026-02-01T00:00:00Z', tags: ['performance', 'seo'] }),
];

describe('loadPosts filtering', () => {
	it('narrows results to posts matching any of the requested tags', () => {
		const result = loadPosts({ allPosts: posts, locale: 'en', tags: ['seo'] });
		expect(result.posts.map((post) => post.id)).toEqual(['p3']);
	});

	it('returns every post when no tags are given', () => {
		const result = loadPosts({ allPosts: posts, locale: 'en' });
		expect(result.total).toBe(posts.length);
	});

	it('narrows results to posts matching the free-text query in the given locale', () => {
		const result = loadPosts({ allPosts: posts, locale: 'en', q: 'design token' });
		expect(result.posts.map((post) => post.id)).toEqual(['p2']);
	});

	it('combines the free-text query with tag filtering', () => {
		const result = loadPosts({ allPosts: posts, locale: 'en', tags: ['seo'], q: 'design token' });
		expect(result.posts).toHaveLength(0);
	});
});

describe('loadPosts sorting', () => {
	it('sorts newest first by default', () => {
		const result = loadPosts({ allPosts: posts, locale: 'en' });
		expect(result.posts.map((post) => post.id)).toEqual(['p2', 'p3', 'p1']);
	});

	it('sorts oldest first when asked', () => {
		const result = loadPosts({ allPosts: posts, locale: 'en', sort: 'date-asc' });
		expect(result.posts.map((post) => post.id)).toEqual(['p1', 'p3', 'p2']);
	});
});

describe('loadPosts pagination', () => {
	it('reports total pages based on the fixed page size', () => {
		const result = loadPosts({ allPosts: posts, locale: 'en', page: 1 });
		expect(result.pageSize).toBe(10);
		expect(result.totalPages).toBe(1);
		expect(result.posts).toHaveLength(3);
	});
});
