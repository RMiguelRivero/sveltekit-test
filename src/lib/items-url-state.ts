import {
	itemChannelSchema,
	itemStatusSchema,
	type ItemChannel,
	type ItemStatus,
} from '$lib/schemas';
import type { ItemSortColumn, ItemsQuery } from '$lib/server/items';

const SORT_COLUMNS: readonly ItemSortColumn[] = [
	'name',
	'status',
	'budget',
	'spent',
	'ctr',
	'updatedAt',
];
const STATUS_VALUES = new Set<string>(itemStatusSchema.options);
const CHANNEL_VALUES = new Set<string>(itemChannelSchema.options);

function isSortColumn(value: string): value is ItemSortColumn {
	return (SORT_COLUMNS as readonly string[]).includes(value);
}

function parsePage(value: string | null): number {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function parseAllowedValues<T extends string>(value: string | null, allowed: Set<string>): T[] {
	if (!value) {
		return [];
	}
	return value.split(',').filter((entry): entry is T => allowed.has(entry));
}

function parseSort(searchParams: URLSearchParams): ItemsQuery['sort'] {
	const column = searchParams.get('sort');
	if (!column || !isSortColumn(column)) {
		return undefined;
	}
	const direction = searchParams.get('dir') === 'asc' ? 'asc' : 'desc';
	return { column, direction };
}

function parseFilters(searchParams: URLSearchParams): ItemsQuery['filters'] {
	const status = parseAllowedValues<ItemStatus>(searchParams.get('status'), STATUS_VALUES);
	const channel = parseAllowedValues<ItemChannel>(searchParams.get('channel'), CHANNEL_VALUES);
	const q = searchParams.get('q')?.trim() || undefined;

	if (status.length === 0 && channel.length === 0 && !q) {
		return undefined;
	}
	return { status, channel, q };
}

export function parseItemsQuery(searchParams: URLSearchParams): ItemsQuery {
	return {
		page: parsePage(searchParams.get('page')),
		sort: parseSort(searchParams),
		filters: parseFilters(searchParams),
	};
}

export function buildItemsQueryString(query: ItemsQuery): string {
	const params = new URLSearchParams();

	if (query.page && query.page > 1) {
		params.set('page', String(query.page));
	}
	if (query.sort) {
		params.set('sort', query.sort.column);
		if (query.sort.direction === 'asc') {
			params.set('dir', 'asc');
		}
	}
	if (query.filters?.status && query.filters.status.length > 0) {
		params.set('status', query.filters.status.join(','));
	}
	if (query.filters?.channel && query.filters.channel.length > 0) {
		params.set('channel', query.filters.channel.join(','));
	}
	if (query.filters?.q) {
		params.set('q', query.filters.q);
	}

	const stringParams = params.toString();
	return stringParams ? `?${stringParams}` : '';
}
