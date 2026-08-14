import { describe, expect, it } from 'vitest';
import { isLocale, unflatten } from './utils';

describe('unflatten', () => {
	it('expands flat keys with dots into nested records', () => {
		const flat = {
			'nav.home': 'Home',
			'nav.blog': 'Blog',
			'dashboard.items.column.name': 'Name',
			'dashboard.items.column.status': 'Status',
		} as const;

		const expected = {
			nav: {
				home: 'Home',
				blog: 'Blog',
			},
			dashboard: {
				items: {
					column: {
						name: 'Name',
						status: 'Status',
					},
				},
			},
		};

		const result = unflatten(flat);

		expect(result).toEqual(expected);
	});
});

describe('isLocale', () => {
	it('returns true for a known locale', () => {
		expect(isLocale('en')).toBe(true);
	});

	it('returns false for an unknown locale', () => {
		expect(isLocale('fr')).toBe(false);
	});
});
