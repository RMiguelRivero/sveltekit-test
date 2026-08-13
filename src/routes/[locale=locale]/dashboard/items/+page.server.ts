import { z } from 'zod';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getItemsStore,
	queryItems,
	updateItemStatus,
	type PaginatedItems,
} from '$lib/server/items';
import { parseItemsQuery } from '$lib/items-url-state';
import { itemUpdateSchema } from '$lib/schemas';
import { canEditItems } from '$lib/permissions';

// This table gets a mutation endpoint in step 14 (inline edit): a write path wants
// consistent single-region execution and headroom for a real DB driver later, unlike
// the stateless, crawler-fetched OG-image route which is edge because it's read-only
// and benefits from low cold-start global distribution instead.
export const config = { runtime: 'nodejs20.x' };

// Data returned depends on page/sort/filter query params, so a single prerendered
// build-time snapshot of this pathname would be wrong for every other combination.
export const prerender = false;

// The mock "DB" read is effectively instant, so this delay is a deliberate stand-in
// for real API/network latency — long enough that the streamed skeleton is actually
// visible while `itemsPromise` is pending, short enough not to feel broken.
const SIMULATED_LATENCY_MS = 300;

function delay(ms: number): Promise<void> {
	return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

async function fetchItemRows(items: PaginatedItems['items']): Promise<PaginatedItems['items']> {
	await delay(SIMULATED_LATENCY_MS);
	return items;
}

export const load: PageServerLoad = ({ url }) => {
	const query = parseItemsQuery(url.searchParams);

	// The filter/sort/paginate pass itself is cheap (in-memory array ops over the mock
	// set), so pagination chrome (total/page/totalPages) resolves synchronously and the
	// skeleton renders with correct counts immediately. Only the row payload is wrapped
	// in the artificially delayed promise, since that's the part the brief asks to
	// stream — `itemsPromise` is intentionally not awaited here so SvelteKit streams it
	// to the client instead of blocking the whole response on it.
	const result = queryItems(getItemsStore(), query);

	return {
		query,
		meta: {
			total: result.total,
			page: result.page,
			pageSize: result.pageSize,
			totalPages: result.totalPages,
		},
		itemsPromise: fetchItemRows(result.items),
	};
};

// Distinct from the `{:catch}` block on the client (step 13), which handles the whole
// `itemsPromise` read failing — this action handles a single row's *write* failing after
// the rest of the table already loaded successfully. Full-table-load failure and
// single-row-edit failure are two separate, deliberately designed partial-failure states,
// not variations of the same thing: the former needs a retry affordance for the whole
// table, the latter needs an optimistic rollback + toast scoped to one row.
export const actions: Actions = {
	updateStatus: async ({ request, locals }) => {
		// Defense in depth: the dashboard layout guard (step 12) already redirects
		// anonymous users away before they ever reach this route, but this endpoint
		// should never trust that alone.
		if (!locals.user) {
			error(401, 'Unauthorized');
		}
		// The `viewer` role is read-only by convention (see $lib/permissions) — the client
		// already disables the edit control for viewers, but that's advisory only, so the
		// actual authorization boundary has to live here too.
		if (!canEditItems(locals.user.role)) {
			error(403, 'Forbidden');
		}

		const formData = Object.fromEntries(await request.formData());
		const result = itemUpdateSchema.safeParse(formData);

		if (!result.success) {
			return fail(400, { errors: z.flattenError(result.error).fieldErrors });
		}

		const updateResult = updateItemStatus(result.data.id, result.data.status);

		if (!updateResult.ok) {
			if (updateResult.reason === 'not_found') {
				return fail(404, { message: 'Item not found.' });
			}
			// Simulated failure path — see SIMULATED_FAILURE_ITEM_ID in $lib/server/items,
			// a deliberate, deterministic trigger (not random flakiness) so the rollback
			// path is reliably testable in Playwright (step 17).
			return fail(500, { message: 'Could not save the update.' });
		}

		return { success: true, item: updateResult.item };
	},
};
