import * as fs from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:fs', () => ({
	readFileSync: vi.fn(),
}));

import { readValidatedJson } from './api';
import { postListSchema } from '$lib/schemas';

afterEach(() => {
	vi.clearAllMocks();
});

describe('readValidatedJson', () => {
	it('returns validated data for valid JSON files', () => {
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

		vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(samplePosts));

		const result = readValidatedJson('posts.json', postListSchema);

		expect(result).toEqual(samplePosts);
	});

	it('throws when the JSON file cannot be parsed', () => {
		vi.mocked(fs.readFileSync).mockReturnValue('not valid json' as never);

		expect(() => readValidatedJson('posts.json', postListSchema)).toThrow(
			'Mock data load failed for posts.json: Unable to parse JSON in posts.json',
		);
	});

	it('throws when the parsed data fails schema validation', () => {
		vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify([{ id: 'bad' }]) as never);

		expect(() => readValidatedJson('posts.json', postListSchema)).toThrow(
			'Schema validation failed for posts.json',
		);
	});

	it('throws when the file cannot be read', () => {
		vi.mocked(fs.readFileSync).mockImplementation(() => {
			throw new Error('ENOENT: no such file or directory');
		});

		expect(() => readValidatedJson('posts.json', postListSchema)).toThrow(
			'Mock data load failed for posts.json: ENOENT: no such file or directory',
		);
	});
});
