import { describe, expect, it } from 'vitest';
import { unflatten } from './utils';

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
