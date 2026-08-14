import type { Item, ItemChannel, ItemStatus } from '$lib/schemas';

export const ITEMS_PER_PAGE = 25;

export type SortDirection = 'asc' | 'desc';

export type ItemSortColumn = 'name' | 'status' | 'budget' | 'spent' | 'ctr' | 'updatedAt';

export type ItemsQuery = {
	page?: number;
	pageSize?: number;
	sort?: { column: ItemSortColumn; direction: SortDirection };
	filters?: { status?: ItemStatus[]; channel?: ItemChannel[]; q?: string };
};

export type PaginatedItems = {
	items: Item[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

function matchesStatus(item: Item, status: ItemStatus[] | undefined): boolean {
	return !status || status.length === 0 || status.includes(item.status);
}

function matchesChannel(item: Item, channel: ItemChannel[] | undefined): boolean {
	return !channel || channel.length === 0 || channel.includes(item.channel);
}

function matchesQuery(item: Item, q: string | undefined): boolean {
	return !q || item.name.toLowerCase().includes(q.toLowerCase());
}

function matchesFilters(item: Item, filters: ItemsQuery['filters']): boolean {
	return (
		matchesStatus(item, filters?.status) &&
		matchesChannel(item, filters?.channel) &&
		matchesQuery(item, filters?.q)
	);
}

function filterItems(items: Item[], filters: ItemsQuery['filters']): Item[] {
	return items.filter((item) => matchesFilters(item, filters));
}

function compareByColumn(a: Item, b: Item, column: ItemSortColumn): number {
	const aValue = a[column];
	const bValue = b[column];
	if (typeof aValue === 'string' && typeof bValue === 'string') {
		return aValue.localeCompare(bValue);
	}
	return (aValue as number) - (bValue as number);
}

function sortItems(items: Item[], sort: ItemsQuery['sort']): Item[] {
	if (!sort) {
		return items;
	}
	const directionMultiplier = sort.direction === 'asc' ? 1 : -1;
	return [...items].sort((a, b) => compareByColumn(a, b, sort.column) * directionMultiplier);
}

function paginateItems(items: Item[], page: number, pageSize: number): Item[] {
	const start = (page - 1) * pageSize;
	return items.slice(start, start + pageSize);
}

export function queryItems(allItems: Item[], query: ItemsQuery): PaginatedItems {
	const { page = 1, pageSize = ITEMS_PER_PAGE, sort, filters } = query;

	const filtered = filterItems(allItems, filters);
	const sorted = sortItems(filtered, sort);
	const total = sorted.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	return {
		items: paginateItems(sorted, page, pageSize),
		total,
		page,
		pageSize,
		totalPages,
	};
}
