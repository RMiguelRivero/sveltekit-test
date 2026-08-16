import { describe, expect, it } from 'vitest';
import { matchesSearchQuery } from './matchesSearchQuery';
import type { Post } from '$lib/schemas';

function makePost(overrides: Partial<Post>): Post {
	return {
		id: 'post_default',
		slug: 'default-post',
		translations: {
			en: { title: 'Sub-second LCP on a content site', excerpt: 'We rebuilt delivery.', body: '' },
			de: { title: 'LCP unter einer Sekunde', excerpt: 'Wir haben etwas neu gebaut.', body: '' },
		},
		tags: [],
		author: { id: 'u_1', name: 'Author', avatarColor: '#123456' },
		publishedAt: '2026-01-01T00:00:00Z',
		readingTimeMinutes: 5,
		coverColor: '#654321',
		...overrides,
	};
}

describe('matchesSearchQuery', () => {
	const post = makePost({});

	it('returns true when the query is empty', () => {
		expect(matchesSearchQuery(post, 'en', '')).toBe(true);
		expect(matchesSearchQuery(post, 'en', '   ')).toBe(true);
	});

	it('matches a substring of the localized title, case-insensitively', () => {
		expect(matchesSearchQuery(post, 'en', 'sub-second')).toBe(true);
		expect(matchesSearchQuery(post, 'en', 'SUB-SECOND')).toBe(true);
	});

	it('matches a substring of the localized excerpt', () => {
		expect(matchesSearchQuery(post, 'en', 'rebuilt delivery')).toBe(true);
		expect(matchesSearchQuery(post, 'de', 'rebuilt delivery')).toBe(false);
	});

	it('does not match a query absent from the localized title or excerpt', () => {
		expect(matchesSearchQuery(post, 'en', 'nonexistent phrase')).toBe(false);
	});

	it('matches against the requested locale only', () => {
		expect(matchesSearchQuery(post, 'de', 'Sekunde')).toBe(true);
		expect(matchesSearchQuery(post, 'de', 'sub-second')).toBe(false);
	});
});
