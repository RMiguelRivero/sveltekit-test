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
	makePost({ id: 'p2', publishedAt: '2026-03-01T00:00:00Z', tags: ['engineering'] }),
	makePost({ id: 'p3', publishedAt: '2026-02-01T00:00:00Z', tags: ['performance', 'seo'] }),
];

describe('loadPosts filtering', () => {
	it('narrows results to posts matching any of the requested tags', () => {
		const result = loadPosts({ allPosts: posts, tags: ['seo'] });
		expect(result.posts.map((post) => post.id)).toEqual(['p3']);
	});

	it('returns every post when no tags are given', () => {
		const result = loadPosts({ allPosts: posts });
		expect(result.total).toBe(posts.length);
	});
});

describe('loadPosts sorting', () => {
	it('sorts newest first by default', () => {
		const result = loadPosts({ allPosts: posts });
		expect(result.posts.map((post) => post.id)).toEqual(['p2', 'p3', 'p1']);
	});

	it('sorts oldest first when asked', () => {
		const result = loadPosts({ allPosts: posts, sort: 'date-asc' });
		expect(result.posts.map((post) => post.id)).toEqual(['p1', 'p3', 'p2']);
	});
});

describe('loadPosts pagination', () => {
	it('reports total pages based on the fixed page size', () => {
		const result = loadPosts({ allPosts: posts, page: 1 });
		expect(result.pageSize).toBe(10);
		expect(result.totalPages).toBe(1);
		expect(result.posts).toHaveLength(3);
	});
});
