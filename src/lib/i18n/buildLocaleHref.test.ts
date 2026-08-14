import { describe, expect, it } from 'vitest';
import { buildLocaleHref } from './buildLocaleHref';

describe('buildLocaleHref', () => {
	it('swaps the locale segment of a top-level pathname', () => {
		expect(buildLocaleHref('/en', '', 'de')).toBe('/de');
	});

	it('swaps the locale segment while preserving the rest of the path', () => {
		expect(buildLocaleHref('/en/dashboard/items', '', 'de')).toBe('/de/dashboard/items');
	});

	it('preserves the query string', () => {
		expect(buildLocaleHref('/en/blog', '?tag=svelte', 'de')).toBe('/de/blog?tag=svelte');
	});

	it('is a no-op when the target locale matches the current one', () => {
		expect(buildLocaleHref('/en/search', '?q=test', 'en')).toBe('/en/search?q=test');
	});
});
