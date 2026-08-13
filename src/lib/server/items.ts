import type { Item, ItemChannel, ItemStatus } from '$lib/schemas';
import { getValidatedItems } from './api';

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

// Mock/in-memory persistence layer standing in for a real database: `static/mocks/items.json`
// is a static file, so a mutation has nowhere durable to land without one. Seeded once per
// server process from the validated fixture; every read (the items page `load`) and write
// (`updateItemStatus`) goes through this same array so edits are observable across requests
// within the process. Two honest limitations worth stating on the follow-up call: it resets
// on server restart, and on serverless platforms (e.g. Vercel) each function instance gets
// its own copy, so a write from one invocation isn't guaranteed visible from another — a real
// deployment needs an actual database here.
let itemsStore: Item[] | null = null;

export function getItemsStore(): Item[] {
	if (itemsStore === null) {
		itemsStore = getValidatedItems();
	}
	return itemsStore;
}

// Reserved so the E2E suite (step 17) can deterministically exercise the optimistic-UI
// rollback path: an update targeting this specific mock item always fails, every other
// item always succeeds. Keying the sentinel off the item id (rather than off the target
// status, e.g. always rejecting "archived") avoids permanently breaking a real status
// value for every other item, while staying just as deterministic and Playwright-testable.
export const SIMULATED_FAILURE_ITEM_ID = 'cmp_0001';

export type UpdateItemStatusResult =
	{ ok: true; item: Item } | { ok: false; reason: 'not_found' | 'simulated_failure' };

export function updateItemStatus(id: string, status: ItemStatus): UpdateItemStatusResult {
	const items = getItemsStore();
	const item = items.find((candidate) => candidate.id === id);

	if (!item) {
		return { ok: false, reason: 'not_found' };
	}
	if (id === SIMULATED_FAILURE_ITEM_ID) {
		return { ok: false, reason: 'simulated_failure' };
	}

	item.status = status;
	item.updatedAt = new Date().toISOString();
	return { ok: true, item };
}
