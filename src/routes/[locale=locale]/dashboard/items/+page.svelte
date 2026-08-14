<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import EditableStatusCell from '$lib/components/dashboard/EditableStatusCell.svelte';
	import { addToast } from '$lib/components/ui/toasts.svelte';
	import {
		itemChannelSchema,
		itemStatusSchema,
		type Item,
		type ItemChannel,
		type ItemStatus,
	} from '$lib/schemas';
	import type { ItemSortColumn, ItemsQuery } from '$lib/server/items';
	import { buildItemsQueryString } from '$lib/items-url-state';
	import { canEditItems } from '$lib/permissions';
	import { capitalize } from '$lib/utils/capitalize';
	import { debounce } from '$lib/utils/debounce';
	import { toPathname } from '$lib/utils/toPathname';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const canEditStatus = $derived(canEditItems(data.user.role));

	const STATUS_OPTIONS = itemStatusSchema.options;
	const CHANNEL_OPTIONS = itemChannelSchema.options;
	const SKELETON_ROW_COUNT = 8;
	const TABLE_COLUMN_COUNT = 8;
	const SEARCH_DEBOUNCE_MS = 300;

	const currencyFormatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0,
	});

	let searchInput = $derived(data.query.filters?.q ?? '');

	// Local `$state` mirror of the resolved rows, kept separate from the server-streamed
	// `data.itemsPromise` — this is the source of truth for rendering *and* the optimistic
	// status edits below, since a devalue-streamed promise itself can't be mutated in place.
	// Re-synced from scratch whenever `data.itemsPromise` changes identity (new page, sort,
	// or filter), which is also when the skeleton should reappear.
	let rows: Item[] = $state([]);
	let loadState: 'pending' | 'ready' | 'error' = $state('pending');
	let pendingRowIds: Set<string> = $state(new Set());

	$effect(() => {
		const itemsPromise = data.itemsPromise;
		loadState = 'pending';
		rows = [];
		let cancelled = false;

		itemsPromise
			.then((resolved) => {
				if (cancelled) return;
				rows = resolved.map((item) => ({ ...item }));
				loadState = 'ready';
			})
			.catch(() => {
				if (cancelled) return;
				loadState = 'error';
			});

		return () => {
			cancelled = true;
		};
	});

	function findRowIndex(id: string): number {
		return rows.findIndex((row) => row.id === id);
	}

	function applyRowStatus(id: string, status: ItemStatus): void {
		const index = findRowIndex(id);
		if (index !== -1) {
			rows[index] = { ...rows[index], status };
		}
	}

	function reconcileRow(item: Item): void {
		const index = findRowIndex(item.id);
		if (index !== -1) {
			rows[index] = item;
		}
	}

	function setRowPending(id: string, isPending: boolean): void {
		const next = new Set(pendingRowIds);
		if (isPending) {
			next.add(id);
		} else {
			next.delete(id);
		}
		pendingRowIds = next;
	}

	function showEditError(message: string): void {
		addToast(message, 'error');
	}

	function formatChannelLabel(channel: ItemChannel): string {
		return channel === 'sms' ? 'SMS' : capitalize(channel);
	}

	function formatCurrency(value: number): string {
		return currencyFormatter.format(value);
	}

	function formatCtr(value: number): string {
		return `${(value * 100).toFixed(1)}%`;
	}

	function formatDate(value: string): string {
		return new Date(value).toLocaleDateString(data.locale);
	}

	function queryHref(query: ItemsQuery): `/${string}` {
		return toPathname(`${page.url.pathname}${buildItemsQueryString(query)}`);
	}

	function navigateToQuery(query: ItemsQuery): void {
		goto(resolve(queryHref(query)));
	}

	function selectStatus(event: Event): void {
		const value = (event.target as HTMLSelectElement).value as ItemStatus | '';
		navigateToQuery({
			...data.query,
			page: 1,
			filters: { ...data.query.filters, status: value ? [value] : [] },
		});
	}

	function selectChannel(event: Event): void {
		const value = (event.target as HTMLSelectElement).value as ItemChannel | '';
		navigateToQuery({
			...data.query,
			page: 1,
			filters: { ...data.query.filters, channel: value ? [value] : [] },
		});
	}

	function navigateSearch(value: string): void {
		navigateToQuery({
			...data.query,
			page: 1,
			filters: { ...data.query.filters, q: value.trim() || undefined },
		});
	}

	const debouncedNavigateSearch = debounce(navigateSearch, SEARCH_DEBOUNCE_MS);

	function handleSearchInput(event: Event): void {
		debouncedNavigateSearch((event.target as HTMLInputElement).value);
	}

	function clearFilters(): void {
		searchInput = '';
		navigateToQuery({ ...data.query, page: 1, filters: undefined });
	}

	function sortBy(column: ItemSortColumn): void {
		const direction =
			data.query.sort?.column === column && data.query.sort.direction === 'asc' ? 'desc' : 'asc';
		navigateToQuery({ ...data.query, page: 1, sort: { column, direction } });
	}

	function ariaSort(column: ItemSortColumn): 'ascending' | 'descending' | 'none' {
		if (data.query.sort?.column !== column) {
			return 'none';
		}
		return data.query.sort.direction === 'asc' ? 'ascending' : 'descending';
	}

	function sortIndicator(column: ItemSortColumn): string {
		if (data.query.sort?.column !== column) {
			return '';
		}
		return data.query.sort.direction === 'asc' ? ' ▲' : ' ▼';
	}

	function retry(): void {
		invalidateAll();
	}

	const hasActiveFilters = $derived(
		Boolean(
			(data.query.filters?.status && data.query.filters.status.length > 0) ||
			(data.query.filters?.channel && data.query.filters.channel.length > 0) ||
			data.query.filters?.q,
		),
	);

	const paginationSummary = $derived(
		data.translations.dashboard.items.pagination.summary
			.replace('{page}', String(data.meta.page))
			.replace('{totalPages}', String(data.meta.totalPages)),
	);
</script>

<svelte:head>
	<title>{data.translations.dashboard.items.title}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<Container size="lg" class="py-8">
	<Heading level={1} class="mb-6">{data.translations.dashboard.items.title}</Heading>

	<Card class="mb-6 p-4">
		<div class="flex flex-wrap items-start gap-6">
			<label class="flex flex-col gap-1 text-sm font-medium text-foreground" for="items-search">
				{data.translations.dashboard.items.filters.search}
				<Input
					id="items-search"
					type="search"
					placeholder={data.translations.dashboard.items.filters.searchPlaceholder}
					bind:value={searchInput}
					oninput={handleSearchInput}
					class="w-56"
				/>
			</label>

			<label class="flex flex-col gap-1 text-sm font-medium text-foreground" for="items-status">
				{data.translations.dashboard.items.filters.status}
				<Select
					id="items-status"
					value={data.query.filters?.status?.[0] ?? ''}
					onchange={selectStatus}
					class="w-40"
				>
					<option value="">{data.translations.dashboard.items.filters.allStatuses}</option>
					{#each STATUS_OPTIONS as status (status)}
						<option value={status}>{capitalize(status)}</option>
					{/each}
				</Select>
			</label>

			<label class="flex flex-col gap-1 text-sm font-medium text-foreground" for="items-channel">
				{data.translations.dashboard.items.filters.channel}
				<Select
					id="items-channel"
					value={data.query.filters?.channel?.[0] ?? ''}
					onchange={selectChannel}
					class="w-40"
				>
					<option value="">{data.translations.dashboard.items.filters.allChannels}</option>
					{#each CHANNEL_OPTIONS as channel (channel)}
						<option value={channel}>{formatChannelLabel(channel)}</option>
					{/each}
				</Select>
			</label>

			{#if hasActiveFilters}
				<Button type="button" variant="ghost" size="sm" onclick={clearFilters} class="self-end">
					{data.translations.dashboard.items.filters.clear}
				</Button>
			{/if}
		</div>
	</Card>

	<div class="overflow-x-auto rounded-lg border border-border">
		<table class="w-full text-sm">
			<thead
				class="bg-muted/50 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase"
			>
				<tr>
					<th scope="col" class="px-4 py-3" aria-sort={ariaSort('name')}>
						<button
							type="button"
							class="inline-flex items-center gap-1 font-medium uppercase"
							onclick={() => sortBy('name')}
						>
							{data.translations.dashboard.items.column.name}{sortIndicator('name')}
						</button>
					</th>
					<th scope="col" class="px-4 py-3" aria-sort={ariaSort('status')}>
						<button
							type="button"
							class="inline-flex items-center gap-1 font-medium uppercase"
							onclick={() => sortBy('status')}
						>
							{data.translations.dashboard.items.column.status}{sortIndicator('status')}
						</button>
					</th>
					<th scope="col" class="px-4 py-3">{data.translations.dashboard.items.column.channel}</th>
					<th scope="col" class="px-4 py-3">{data.translations.dashboard.items.column.owner}</th>
					<th scope="col" class="px-4 py-3" aria-sort={ariaSort('budget')}>
						<button
							type="button"
							class="inline-flex items-center gap-1 font-medium uppercase"
							onclick={() => sortBy('budget')}
						>
							{data.translations.dashboard.items.column.budget}{sortIndicator('budget')}
						</button>
					</th>
					<th scope="col" class="px-4 py-3" aria-sort={ariaSort('spent')}>
						<button
							type="button"
							class="inline-flex items-center gap-1 font-medium uppercase"
							onclick={() => sortBy('spent')}
						>
							{data.translations.dashboard.items.column.spent}{sortIndicator('spent')}
						</button>
					</th>
					<th scope="col" class="px-4 py-3" aria-sort={ariaSort('ctr')}>
						<button
							type="button"
							class="inline-flex items-center gap-1 font-medium uppercase"
							onclick={() => sortBy('ctr')}
						>
							{data.translations.dashboard.items.column.ctr}{sortIndicator('ctr')}
						</button>
					</th>
					<th scope="col" class="px-4 py-3" aria-sort={ariaSort('updatedAt')}>
						<button
							type="button"
							class="inline-flex items-center gap-1 font-medium uppercase"
							onclick={() => sortBy('updatedAt')}
						>
							{data.translations.dashboard.items.column.updated}{sortIndicator('updatedAt')}
						</button>
					</th>
				</tr>
			</thead>
			<tbody>
				<!-- Two distinct, deliberately designed partial-failure states: the whole
				`itemsPromise` read failing (below, full-table retry) vs. a single row's
				*write* failing after the table already loaded (EditableStatusCell's optimistic
				rollback + toast, scoped to that one row) — see the server action for the
				write-side half of this comment. -->
				{#if loadState === 'pending'}
					{#each Array(SKELETON_ROW_COUNT) as _, rowIndex (rowIndex)}
						<tr class="border-t border-border">
							{#each Array(TABLE_COLUMN_COUNT) as __, colIndex (colIndex)}
								<td class="px-4 py-3">
									<div class="h-5 w-full max-w-24 animate-pulse rounded bg-muted"></div>
								</td>
							{/each}
						</tr>
					{/each}
				{:else if loadState === 'error'}
					<tr>
						<td colspan={TABLE_COLUMN_COUNT} class="p-0">
							<Card class="m-4 border-destructive/50 py-12 text-center">
								<p class="mb-4 text-destructive">{data.translations.common.error.generic}</p>
								<Button type="button" variant="outline" onclick={retry}>
									{data.translations.common.retry}
								</Button>
							</Card>
						</td>
					</tr>
				{:else if rows.length === 0}
					<tr>
						<td colspan={TABLE_COLUMN_COUNT} class="p-0">
							<Card class="m-4 py-12 text-center text-muted-foreground">
								{data.translations.dashboard.items.empty}
							</Card>
						</td>
					</tr>
				{:else}
					{#each rows as row (row.id)}
						<tr class="border-t border-border">
							<td class="px-4 py-3 font-medium text-foreground">{row.name}</td>
							<td class="px-4 py-3">
								<EditableStatusCell
									item={row}
									pending={pendingRowIds.has(row.id)}
									editable={canEditStatus}
									onOptimisticUpdate={(status) => applyRowStatus(row.id, status)}
									onReconcile={reconcileRow}
									onRollback={(status) => applyRowStatus(row.id, status)}
									onPendingChange={(isPending) => setRowPending(row.id, isPending)}
									onError={showEditError}
								/>
							</td>
							<td class="px-4 py-3 text-muted-foreground">{formatChannelLabel(row.channel)}</td>
							<td class="px-4 py-3 text-muted-foreground">{row.owner.name}</td>
							<td class="px-4 py-3">{formatCurrency(row.budget)}</td>
							<td class="px-4 py-3">{formatCurrency(row.spent)}</td>
							<td class="px-4 py-3">{formatCtr(row.ctr)}</td>
							<td class="px-4 py-3 text-muted-foreground">{formatDate(row.updatedAt)}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	<nav
		class="mt-6 flex items-center justify-center gap-6 border-t border-border pt-6"
		aria-label="Items pagination"
	>
		{#if data.meta.page > 1}
			<Button
				href={resolve(queryHref({ ...data.query, page: data.meta.page - 1 }))}
				variant="outline"
			>
				{data.translations.dashboard.items.pagination.previous}
			</Button>
		{/if}

		<span class="font-medium text-foreground">{paginationSummary}</span>

		{#if data.meta.page < data.meta.totalPages}
			<Button
				href={resolve(queryHref({ ...data.query, page: data.meta.page + 1 }))}
				variant="outline"
			>
				{data.translations.dashboard.items.pagination.next}
			</Button>
		{/if}
	</nav>
</Container>
