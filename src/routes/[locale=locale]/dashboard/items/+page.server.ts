import type { PageServerLoad } from './$types';
import { getValidatedItems } from '$lib/server/api';
import { queryItems, type PaginatedItems } from '$lib/server/items';
import { parseItemsQuery } from '$lib/items-url-state';

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
	const result = queryItems(getValidatedItems(), query);

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
