<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import SearchIcon from '@lucide/svelte/icons/search';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import type { PageData } from './$types';
	import { debounce } from '$lib/utils/debounce';
	import { toPathname } from '$lib/utils/toPathname';

	let { data }: { data: PageData } = $props();

	const SEARCH_DEBOUNCE_MS = 300;

	function buildQueryString(page: number, tags: string[], sort: string, q: string): string {
		const params = new SvelteURLSearchParams();
		if (page > 1) {
			params.set('page', String(page));
		}
		if (tags.length > 0) {
			params.set('tags', tags.join(','));
		}
		if (sort !== 'date-desc') {
			params.set('sort', sort);
		}
		if (q) {
			params.set('q', q);
		}
		const stringParams = params.toString();
		return stringParams ? `?${stringParams}` : '';
	}

	let searchInput = $derived(data.currentQuery);

	const currentQueryString = $derived(
		buildQueryString(data.currentPage, data.currentTags, data.currentSort, data.currentQuery),
	);
	const previousPageUrl = $derived(
		toPathname(
			`${page.url.pathname}${buildQueryString(data.currentPage - 1, data.currentTags, data.currentSort, data.currentQuery)}`,
		),
	);
	const nextPageUrl = $derived(
		toPathname(
			`${page.url.pathname}${buildQueryString(data.currentPage + 1, data.currentTags, data.currentSort, data.currentQuery)}`,
		),
	);
	// Filtered/searched/paginated views are thin, duplicate-content variants of the same
	// list — keep only the canonical, unfiltered first page indexable.
	const isNoindex = $derived(
		data.currentTags.length > 0 || data.currentPage > 1 || Boolean(data.currentQuery),
	);

	function sortHandler(event: Event) {
		const target = event.target as HTMLSelectElement;
		const qs = buildQueryString(1, data.currentTags, target.value, data.currentQuery);
		const url = toPathname(`${page.url.pathname}${qs}`);
		goto(resolve(url));
	}

	function filterByTag(tag: string) {
		const newTags = data.currentTags.includes(tag)
			? data.currentTags.filter((t) => t !== tag)
			: [...data.currentTags, tag];
		const qs = buildQueryString(1, newTags, data.currentSort, data.currentQuery);
		const url = `${page.url.pathname}${qs}`;
		goto(resolve(toPathname(url)));
	}

	function navigateSearch(value: string) {
		const qs = buildQueryString(1, data.currentTags, data.currentSort, value.trim());
		const url = toPathname(`${page.url.pathname}${qs}`);
		goto(resolve(url));
	}

	const debouncedNavigateSearch = debounce(navigateSearch, SEARCH_DEBOUNCE_MS);

	function searchHandler(event: Event) {
		debouncedNavigateSearch((event.target as HTMLInputElement).value);
	}

	function buildPostUrl(slug: string) {
		return toPathname(`${page.url.pathname}/${slug}`);
	}

	function readingTimeLabel(minutes: number): string {
		return data.translations.blog.readingTime.replace('{minutes}', String(minutes));
	}

	function tagLabel(slug: string): string {
		return data.allTags.find((tag) => tag.slug === slug)?.label[data.locale] ?? slug;
	}
</script>

<Seo
	title={data.translations.blog.meta.title}
	description={data.translations.blog.meta.description}
	locale={data.locale}
	origin={data.origin}
	path={`/blog${currentQueryString}`}
/>

<svelte:head>
	{#if isNoindex}
		<meta name="robots" content="noindex" />
	{/if}
</svelte:head>

<Container size="md" class="py-8">
	<Heading level={1} class="mb-6">{data.translations.blog.title}</Heading>

	<Card class="mb-8 p-4">
		<div class="flex flex-wrap items-end gap-4">
			<label class="flex flex-col gap-1 text-sm font-medium text-foreground" for="blog-search">
				{data.translations.search.title}
				<div class="relative">
					<SearchIcon
						class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
						aria-hidden="true"
					/>
					<Input
						id="blog-search"
						type="search"
						placeholder={data.translations.search.placeholder}
						bind:value={searchInput}
						oninput={searchHandler}
						class="w-64 pl-9"
					/>
				</div>
			</label>

			<label class="flex flex-col gap-1 text-sm font-medium text-foreground" for="blog-sort">
				Sort
				<Select id="blog-sort" value={data.currentSort} onchange={sortHandler} class="w-48">
					<option value="date-desc">Newest First</option>
					<option value="date-asc">Oldest First</option>
				</Select>
			</label>
		</div>

		<div class="mt-4 flex flex-col gap-2 border-t border-border pt-4">
			<span class="text-sm font-medium text-foreground">{data.translations.blog.filterByTags}</span>
			<div class="flex flex-wrap gap-2">
				{#each data.allTags as tag (tag.slug)}
					<button
						type="button"
						class="cursor-pointer appearance-none border-0 bg-transparent p-0"
						aria-pressed={data.currentTags.includes(tag.slug)}
						onclick={() => filterByTag(tag.slug)}
					>
						<Badge
							variant={data.currentTags.includes(tag.slug) ? 'default' : 'outline'}
							class="transition hover:opacity-80"
						>
							{tag.label[data.locale]}
						</Badge>
					</button>
				{/each}
			</div>
		</div>
	</Card>

	{#if data.currentQuery && data.paginatedPosts.total > 0}
		<p class="mb-4 text-sm text-muted-foreground">
			{data.translations.search.results
				.replace('{count}', String(data.paginatedPosts.total))
				.replace('{query}', data.currentQuery)}
		</p>
	{/if}

	{#if data.paginatedPosts.posts.length === 0}
		<Card class="py-12 text-center text-muted-foreground">
			{data.currentQuery ? data.translations.search.noResults : data.translations.blog.empty}
		</Card>
	{:else}
		<div class="space-y-6">
			{#each data.paginatedPosts.posts as post (post.id)}
				<Card class="p-6 transition hover:shadow-md">
					<div class="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
						<h2 class="flex-1 text-xl font-semibold">{post.translations[data.locale].title}</h2>
						<time
							datetime={post.publishedAt}
							class="text-sm whitespace-nowrap text-muted-foreground"
						>
							{new Date(post.publishedAt).toLocaleDateString(data.locale)}
						</time>
					</div>
					<p class="mb-4 leading-relaxed text-foreground">
						{post.translations[data.locale].excerpt}
						<a href={resolve(buildPostUrl(post.slug))} class="text-primary hover:underline">
							{data.translations.blog.readMore}
						</a>
					</p>
					<div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:text-sm">
						<span class="text-muted-foreground">{readingTimeLabel(post.readingTimeMinutes)}</span>
						<div class="flex flex-wrap gap-2">
							{#each post.tags as tag (tag)}
								<Badge variant={data.currentTags.includes(tag) ? 'default' : 'outline'}>
									{tagLabel(tag)}
								</Badge>
							{/each}
						</div>
					</div>
				</Card>
			{/each}
		</div>

		{#if data.paginatedPosts.totalPages > 1}
			<nav
				class="mt-8 flex items-center justify-center gap-6 border-t border-border pt-6"
				aria-label="Blog pagination"
			>
				{#if data.currentPage > 1}
					<Button href={resolve(previousPageUrl)} variant="primary">← Previous</Button>
				{/if}

				<span class="font-medium text-foreground">
					Page {data.currentPage} of {data.paginatedPosts.totalPages}
				</span>

				{#if data.currentPage < data.paginatedPosts.totalPages}
					<Button href={resolve(nextPageUrl)} variant="primary">Next →</Button>
				{/if}
			</nav>
		{/if}
	{/if}
</Container>
