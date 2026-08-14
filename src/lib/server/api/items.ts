import { itemListSchema, type Item } from '$lib/schemas';
import itemsData from '../../../../static/mocks/items.json';
import type { UpdateItemOptions, UpdateItemPatch, UpdateItemResult } from './types';
import { validateData } from './utils';

// Mock/in-memory persistence layer standing in for a real database: `static/mocks/items.json`
// is a static file, so a mutation has nowhere durable to land without one. Seeded once per
// server process from the validated fixture; every read (`getItems`) and write (`updateItem`)
// goes through this same array so edits are observable across requests within the process.
// Two honest limitations worth stating on the follow-up call: it resets on server restart, and
// on serverless platforms (e.g. Vercel) each function instance gets its own copy, so a write
// from one invocation isn't guaranteed visible from another — a real deployment needs an
// actual database here.
let itemsStore: Item[] | null = null;

function getItemsStore(): Item[] {
	if (itemsStore === null) {
		itemsStore = validateData(itemsData, itemListSchema);
	}
	return itemsStore;
}

export async function getItems(): Promise<Item[]> {
	return getItemsStore();
}

export async function updateItem(
	id: string,
	patch: UpdateItemPatch,
	options: UpdateItemOptions = {},
): Promise<UpdateItemResult> {
	const items = getItemsStore();
	const item = items.find((candidate) => candidate.id === id);
	await new Promise((resolve) => setTimeout(resolve, 500)); // simulate network latency

	if (!item) {
		return { ok: false, reason: 'not_found' };
	}
	if (options.simulateFailure) {
		await new Promise((resolve) => setTimeout(resolve, 2000)); // simulate network latency
		return { ok: false, reason: 'simulated_failure' };
	}

	Object.assign(item, patch);
	item.updatedAt = new Date().toISOString();
	return { ok: true, item };
}
