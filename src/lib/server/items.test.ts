import { describe, expect, it } from 'vitest';
import { queryItems } from './items';
import type { Item } from '$lib/schemas';

function makeItem(overrides: Partial<Item>): Item {
	return {
		id: 'item_default',
		name: 'Default Campaign',
		status: 'active',
		channel: 'email',
		owner: { id: 'u_1', name: 'Owner' },
		budget: 1000,
		spent: 500,
		impressions: 10000,
		clicks: 100,
		ctr: 0.01,
		startDate: '2026-01-01',
		endDate: '2026-02-01',
		updatedAt: '2026-01-15T00:00:00Z',
		tags: [],
		...overrides,
	};
}

const items: Item[] = [
	makeItem({ id: 'a', name: 'Alpha', status: 'active', channel: 'email', budget: 300 }),
	makeItem({ id: 'b', name: 'Bravo', status: 'paused', channel: 'sms', budget: 100 }),
	makeItem({ id: 'c', name: 'Charlie', status: 'active', channel: 'web', budget: 200 }),
	makeItem({ id: 'd', name: 'Delta', status: 'draft', channel: 'email', budget: 400 }),
];

describe('queryItems filtering', () => {
	it('narrows results by status', () => {
		const result = queryItems(items, { filters: { status: ['active'] } });
		expect(result.items.map((item) => item.id)).toEqual(['a', 'c']);
	});

	it('narrows results by channel', () => {
		const result = queryItems(items, { filters: { channel: ['email'] } });
		expect(result.items.map((item) => item.id)).toEqual(['a', 'd']);
	});

	it('narrows results by a case-insensitive name query', () => {
		const result = queryItems(items, { filters: { q: 'ALPHA' } });
		expect(result.items.map((item) => item.id)).toEqual(['a']);
	});

	it('returns everything when no filters are given', () => {
		const result = queryItems(items, {});
		expect(result.total).toBe(items.length);
	});
});

describe('queryItems sorting', () => {
	it('sorts ascending by a numeric column', () => {
		const result = queryItems(items, { sort: { column: 'budget', direction: 'asc' } });
		expect(result.items.map((item) => item.id)).toEqual(['b', 'c', 'a', 'd']);
	});

	it('sorts descending by a numeric column', () => {
		const result = queryItems(items, { sort: { column: 'budget', direction: 'desc' } });
		expect(result.items.map((item) => item.id)).toEqual(['d', 'a', 'c', 'b']);
	});
});

describe('queryItems pagination', () => {
	it('slices results to the requested page size', () => {
		const result = queryItems(items, { page: 1, pageSize: 2 });
		expect(result.items).toHaveLength(2);
		expect(result.totalPages).toBe(2);
	});

	it('returns the remaining items on the second page', () => {
		const result = queryItems(items, {
			page: 2,
			pageSize: 2,
			sort: { column: 'name', direction: 'asc' },
		});
		expect(result.items.map((item) => item.id)).toEqual(['c', 'd']);
	});
});

describe('queryItems combined filter, sort, and page', () => {
	it('applies filtering, sorting, and pagination together', () => {
		const result = queryItems(items, {
			filters: { status: ['active', 'draft'] },
			sort: { column: 'budget', direction: 'asc' },
			page: 1,
			pageSize: 2,
		});
		expect(result.items.map((item) => item.id)).toEqual(['c', 'a']);
		expect(result.total).toBe(3);
		expect(result.totalPages).toBe(2);
	});
});
