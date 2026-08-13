<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// `resolve()` is typed against a generated union of literal route/pathname templates,
	// which a computed `string` can never satisfy structurally even when well-formed at
	// runtime (these pathnames are built from our own locale + query-string logic, always
	// starting with "/"). Assert the concrete shape `resolve` accepts instead of losing
	// its base-path resolution and the `svelte/no-navigation-without-resolve` lint check.
	function toPathname(path: string): `/${string}` {
		return path as `/${string}`;
	}

	function buildQueryString(page: number, tags: string[], sort: string): string {
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
		const stringParams = params.toString();
		return stringParams ? `?${stringParams}` : '';
	}

	const currentQueryString = $derived(
		buildQueryString(data.currentPage, data.currentTags, data.currentSort),
	);
	const previousPageUrl = $derived(
		`${page.url.pathname}${buildQueryString(data.currentPage - 1, data.currentTags, data.currentSort)}`,
	);
	const nextPageUrl = $derived(
		`${page.url.pathname}${buildQueryString(data.currentPage + 1, data.currentTags, data.currentSort)}`,
	);
	// Filtered/paginated views are thin, duplicate-content variants of the same list —
	// keep only the canonical, unfiltered first page indexable.
	const isNoindex = $derived(data.currentTags.length > 0 || data.currentPage > 1);

	function sortHandler(event: Event) {
		const target = event.target as HTMLSelectElement;
		const qs = buildQueryString(1, data.currentTags, target.value);
		const url = `${page.url.pathname}${qs}`;
		goto(resolve(toPathname(url)));
	}

	function filterByTag(tag: string) {
		const newTags = data.currentTags.includes(tag)
			? data.currentTags.filter((t) => t !== tag)
			: [...data.currentTags, tag];
		const qs = buildQueryString(1, newTags, data.currentSort);
		const url = `${page.url.pathname}${qs}`;
		goto(resolve(toPathname(url)));
	}

	function buildPostUrl(slug: string): string {
		return `${page.url.pathname}/${slug}`;
	}

	function readingTimeLabel(minutes: number): string {
		return data.translations.blog.readingTime.replace('{minutes}', String(minutes));
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

	<div class="mb-8 flex flex-row-reverse flex-wrap gap-4">
		<label class="flex items-center gap-2">
			<span class="font-medium">Sort:</span>
			<Select value={data.currentSort} onchange={sortHandler} class="w-48">
				<option value="date-desc">Newest First</option>
				<option value="date-asc">Oldest First</option>
			</Select>
		</label>
	</div>

	{#if data.paginatedPosts.posts.length === 0}
		<Card class="py-12 text-center text-muted-foreground">
			{data.translations.blog.empty}
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
						<a
							href={resolve(toPathname(buildPostUrl(post.slug)))}
							class="text-primary hover:underline"
						>
							{data.translations.blog.readMore}
						</a>
					</p>
					<div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:text-sm">
						<span class="text-muted-foreground">{readingTimeLabel(post.readingTimeMinutes)}</span>
						<div class="flex flex-wrap gap-2">
							{#each post.tags as tag (tag)}
								<button
									type="button"
									class="cursor-pointer appearance-none border-0 bg-transparent p-0"
									onclick={() => filterByTag(tag)}
								>
									<Badge
										variant={data.currentTags.includes(tag) ? 'default' : 'outline'}
										class="transition hover:opacity-80"
									>
										{tag}
									</Badge>
								</button>
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
					<Button href={resolve(toPathname(previousPageUrl))} variant="primary">← Previous</Button>
				{/if}

				<span class="font-medium text-foreground">
					Page {data.currentPage} of {data.paginatedPosts.totalPages}
				</span>

				{#if data.currentPage < data.paginatedPosts.totalPages}
					<Button href={resolve(toPathname(nextPageUrl))} variant="primary">Next →</Button>
				{/if}
			</nav>
		{/if}
	{/if}
</Container>
