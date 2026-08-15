import { describe, expect, it } from 'vitest';
import { isPathActive } from './isPathActive';

describe('isPathActive', () => {
	it('matches only an identical pathname when exact', () => {
		expect(isPathActive('/en', '/en', true)).toBe(true);
	});

	it('rejects a prefixed pathname when exact', () => {
		expect(isPathActive('/en/blog', '/en', true)).toBe(false);
	});

	it('matches a prefixed pathname when not exact', () => {
		expect(isPathActive('/en/blog/my-post', '/en/blog', false)).toBe(true);
	});

	it('rejects an unrelated pathname when not exact', () => {
		expect(isPathActive('/en/login', '/en/blog', false)).toBe(false);
	});
});
