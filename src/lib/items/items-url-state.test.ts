import { describe, expect, it } from 'vitest';
import { buildItemsQueryString, parseItemsQuery } from './items-url-state';
import type { ItemsQuery } from '../server/items';

function paramsFrom(query: string): URLSearchParams {
	return new URLSearchParams(query);
}

describe('parseItemsQuery', () => {
	it('defaults page to 1 when absent', () => {
		const result = parseItemsQuery(paramsFrom(''));
		expect(result.page).toBe(1);
	});

	it('parses a valid page number', () => {
		const result = parseItemsQuery(paramsFrom('page=3'));
		expect(result.page).toBe(3);
	});

	it.each(['0', '-1', '1.5', 'abc', ''])('falls back to page 1 for invalid page %s', (page) => {
		const result = parseItemsQuery(paramsFrom(`page=${page}`));
		expect(result.page).toBe(1);
	});

	it('leaves sort undefined when the column param is absent', () => {
		const result = parseItemsQuery(paramsFrom(''));
		expect(result.sort).toBeUndefined();
	});

	it('ignores an unknown sort column', () => {
		const result = parseItemsQuery(paramsFrom('sort=notAColumn'));
		expect(result.sort).toBeUndefined();
	});

	it('defaults sort direction to desc when a valid column is given', () => {
		const result = parseItemsQuery(paramsFrom('sort=budget'));
		expect(result.sort).toEqual({ column: 'budget', direction: 'desc' });
	});

	it('parses an explicit ascending direction', () => {
		const result = parseItemsQuery(paramsFrom('sort=budget&dir=asc'));
		expect(result.sort).toEqual({ column: 'budget', direction: 'asc' });
	});

	it('treats any non-asc dir value as desc', () => {
		const result = parseItemsQuery(paramsFrom('sort=budget&dir=sideways'));
		expect(result.sort?.direction).toBe('desc');
	});

	it('leaves filters undefined when no filter params are present', () => {
		const result = parseItemsQuery(paramsFrom('page=2'));
		expect(result.filters).toBeUndefined();
	});

	it('parses comma-separated status values, dropping unknown ones', () => {
		const result = parseItemsQuery(paramsFrom('status=active,paused,bogus'));
		expect(result.filters?.status).toEqual(['active', 'paused']);
	});

	it('parses comma-separated channel values, dropping unknown ones', () => {
		const result = parseItemsQuery(paramsFrom('channel=email,sms,carrier-pigeon'));
		expect(result.filters?.channel).toEqual(['email', 'sms']);
	});

	it('trims the search query and omits it when blank', () => {
		const withSpaces = parseItemsQuery(paramsFrom('q=%20hello%20'));
		expect(withSpaces.filters?.q).toBe('hello');

		const blank = parseItemsQuery(paramsFrom('q=%20%20'));
		expect(blank.filters).toBeUndefined();
	});

	it('combines page, sort, and multi-facet filters from a full query string', () => {
		const result = parseItemsQuery(
			paramsFrom('page=2&sort=name&dir=asc&status=active,draft&channel=email&q=launch'),
		);
		expect(result).toEqual({
			page: 2,
			sort: { column: 'name', direction: 'asc' },
			filters: { status: ['active', 'draft'], channel: ['email'], q: 'launch' },
		});
	});
});

describe('buildItemsQueryString', () => {
	it('returns an empty string for an empty query', () => {
		expect(buildItemsQueryString({})).toBe('');
	});

	it('omits page when it is 1 and includes it otherwise', () => {
		expect(buildItemsQueryString({ page: 1 })).toBe('');
		expect(buildItemsQueryString({ page: 2 })).toBe('?page=2');
	});

	it('includes sort column and omits dir for the default desc direction', () => {
		const qs = buildItemsQueryString({ sort: { column: 'ctr', direction: 'desc' } });
		expect(qs).toBe('?sort=ctr');
	});

	it('includes dir=asc when the direction is ascending', () => {
		const qs = buildItemsQueryString({ sort: { column: 'ctr', direction: 'asc' } });
		expect(qs).toBe('?sort=ctr&dir=asc');
	});

	it('joins multi-select filters with commas and omits empty ones', () => {
		const qs = buildItemsQueryString({
			filters: { status: ['active', 'paused'], channel: [], q: undefined },
		});
		expect(qs).toBe('?status=active%2Cpaused');
	});

	it('includes q and omits it when falsy', () => {
		expect(buildItemsQueryString({ filters: { q: 'launch' } })).toBe('?q=launch');
		expect(buildItemsQueryString({ filters: { q: '' } })).toBe('');
	});

	it('serializes a full query with every field populated', () => {
		const query: ItemsQuery = {
			page: 3,
			sort: { column: 'spent', direction: 'asc' },
			filters: { status: ['active'], channel: ['email', 'sms'], q: 'launch' },
		};
		const qs = buildItemsQueryString(query);
		expect(paramsFrom(qs.slice(1))).toEqual(
			paramsFrom('page=3&sort=spent&dir=asc&status=active&channel=email%2Csms&q=launch'),
		);
	});
});

describe('parseItemsQuery and buildItemsQueryString round-trip', () => {
	it('reproduces an equivalent query after a parse -> build -> parse cycle', () => {
		const original = parseItemsQuery(
			paramsFrom('page=2&sort=updatedAt&dir=asc&status=active,paused&channel=web&q=summer'),
		);
		const rebuilt = parseItemsQuery(paramsFrom(buildItemsQueryString(original).slice(1)));
		expect(rebuilt).toEqual(original);
	});

	it('round-trips the default (empty) query back to itself', () => {
		const original = parseItemsQuery(paramsFrom(''));
		const rebuilt = parseItemsQuery(paramsFrom(buildItemsQueryString(original).slice(1)));
		expect(rebuilt).toEqual(original);
	});
});
