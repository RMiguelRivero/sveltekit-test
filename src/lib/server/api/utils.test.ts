import { describe, expect, it } from 'vitest';
import { postListSchema } from '$lib/schemas';
import { validateData } from './utils';

describe('validateData', () => {
	it('returns validated data when data matches schema', () => {
		const samplePosts = [
			{
				id: 'post_000',
				slug: 'sub-second-lcp-on-a-content-site',
				translations: {
					en: {
						title: 'Sub-second LCP on a content site',
						excerpt: 'Fast content wins',
						body: 'Body text',
					},
					de: {
						title: 'LCP unter einer Sekunde',
						excerpt: 'Schneller Inhalt',
						body: 'Textkörper',
					},
				},
				tags: ['performance', 'engineering'],
				author: { id: 'u_omar', name: 'Omar Haddad', avatarColor: '#a855f7' },
				publishedAt: '2026-05-31T00:00:00Z',
				readingTimeMinutes: 3,
				coverColor: '#1e293b',
			},
		];
		const result = validateData(samplePosts, postListSchema);
		expect(result).toEqual(samplePosts);
	});

	it('throws when data fails zod parsing', () => {
		expect(() => validateData([{ name: 'invalid data' }], postListSchema)).toThrow(
			new RegExp(`Schema validation failed for ${postListSchema.meta()?.id}`),
		);
	});
});
