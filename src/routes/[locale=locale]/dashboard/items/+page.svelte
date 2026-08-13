<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { BadgeVariant } from '$lib/components/ui/types';
	import {
		itemChannelSchema,
		itemStatusSchema,
		type ItemChannel,
		type ItemStatus,
	} from '$lib/schemas';
	import type { ItemSortColumn, ItemsQuery } from '$lib/server/items';
	import { buildItemsQueryString } from '$lib/items-url-state';
	import { capitalize } from '$lib/utils/capitalize';
	import { toPathname } from '$lib/utils/toPathname';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const STATUS_OPTIONS = itemStatusSchema.options;
	const CHANNEL_OPTIONS = itemChannelSchema.options;
	const SKELETON_ROW_COUNT = 8;
	const TABLE_COLUMN_COUNT = 8;

	const STATUS_BADGE_VARIANT: Record<ItemStatus, BadgeVariant> = {
		draft: 'outline',
		scheduled: 'default',
		active: 'success',
		paused: 'warning',
		completed: 'default',
		archived: 'outline',
	};

	const currencyFormatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0,
	});

	let searchInput = $derived(data.query.filters?.q ?? '');

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

	function toggleStatus(status: ItemStatus): void {
		const current = data.query.filters?.status ?? [];
		const next = current.includes(status)
			? current.filter((value) => value !== status)
			: [...current, status];
		navigateToQuery({ ...data.query, page: 1, filters: { ...data.query.filters, status: next } });
	}

	function toggleChannel(channel: ItemChannel): void {
		const current = data.query.filters?.channel ?? [];
		const next = current.includes(channel)
			? current.filter((value) => value !== channel)
			: [...current, channel];
		navigateToQuery({ ...data.query, page: 1, filters: { ...data.query.filters, channel: next } });
	}

	function submitSearch(event: SubmitEvent): void {
		event.preventDefault();
		navigateToQuery({
			...data.query,
			page: 1,
			filters: { ...data.query.filters, q: searchInput.trim() || undefined },
		});
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
			<form class="flex items-end gap-2" onsubmit={submitSearch}>
				<label class="flex flex-col gap-1 text-sm font-medium text-foreground" for="items-search">
					{data.translations.dashboard.items.filters.search}
					<Input
						id="items-search"
						type="search"
						placeholder={data.translations.dashboard.items.filters.searchPlaceholder}
						bind:value={searchInput}
						class="w-56"
					/>
				</label>
				<Button type="submit" variant="secondary">
					{data.translations.dashboard.items.filters.apply}
				</Button>
			</form>

			<fieldset class="flex flex-col gap-2">
				<legend class="text-sm font-medium text-foreground">
					{data.translations.dashboard.items.filters.status}
				</legend>
				<div class="flex flex-wrap gap-3">
					{#each STATUS_OPTIONS as status (status)}
						<label class="flex items-center gap-1.5 text-sm text-foreground">
							<input
								type="checkbox"
								checked={data.query.filters?.status?.includes(status) ?? false}
								onchange={() => toggleStatus(status)}
								class="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
							/>
							{capitalize(status)}
						</label>
					{/each}
				</div>
			</fieldset>

			<fieldset class="flex flex-col gap-2">
				<legend class="text-sm font-medium text-foreground">
					{data.translations.dashboard.items.filters.channel}
				</legend>
				<div class="flex flex-wrap gap-3">
					{#each CHANNEL_OPTIONS as channel (channel)}
						<label class="flex items-center gap-1.5 text-sm text-foreground">
							<input
								type="checkbox"
								checked={data.query.filters?.channel?.includes(channel) ?? false}
								onchange={() => toggleChannel(channel)}
								class="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
							/>
							{formatChannelLabel(channel)}
						</label>
					{/each}
				</div>
			</fieldset>

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
				{#await data.itemsPromise}
					{#each Array(SKELETON_ROW_COUNT) as _, rowIndex (rowIndex)}
						<tr class="border-t border-border">
							{#each Array(TABLE_COLUMN_COUNT) as __, colIndex (colIndex)}
								<td class="px-4 py-3">
									<div class="h-4 w-full max-w-24 animate-pulse rounded bg-muted"></div>
								</td>
							{/each}
						</tr>
					{/each}
				{:then items}
					{#if items.length === 0}
						<tr>
							<td colspan={TABLE_COLUMN_COUNT} class="p-0">
								<Card class="m-4 py-12 text-center text-muted-foreground">
									{data.translations.dashboard.items.empty}
								</Card>
							</td>
						</tr>
					{:else}
						{#each items as item (item.id)}
							<tr class="border-t border-border">
								<td class="px-4 py-3 font-medium text-foreground">{item.name}</td>
								<td class="px-4 py-3">
									<Badge variant={STATUS_BADGE_VARIANT[item.status]}
										>{capitalize(item.status)}</Badge
									>
								</td>
								<td class="px-4 py-3 text-muted-foreground">{formatChannelLabel(item.channel)}</td>
								<td class="px-4 py-3 text-muted-foreground">{item.owner.name}</td>
								<td class="px-4 py-3">{formatCurrency(item.budget)}</td>
								<td class="px-4 py-3">{formatCurrency(item.spent)}</td>
								<td class="px-4 py-3">{formatCtr(item.ctr)}</td>
								<td class="px-4 py-3 text-muted-foreground">{formatDate(item.updatedAt)}</td>
							</tr>
						{/each}
					{/if}
				{:catch}
					<tr>
						<td colspan={TABLE_COLUMN_COUNT} class="p-0">
							<Card class="m-4 border-destructive/50 py-12 text-center">
								<p class="mb-4 text-destructive">{data.translations.common.error}</p>
								<Button type="button" variant="outline" onclick={retry}>
									{data.translations.common.retry}
								</Button>
							</Card>
						</td>
					</tr>
				{/await}
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
