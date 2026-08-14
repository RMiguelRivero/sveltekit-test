import type { Item } from '$lib/schemas';

export type UpdateItemPatch = Partial<Omit<Item, 'id'>>;

export type UpdateItemOptions = {
	simulateFailure?: boolean;
};

export type UpdateItemResult =
	{ ok: true; item: Item } | { ok: false; reason: 'not_found' | 'simulated_failure' };
