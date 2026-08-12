<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	let { data }: { data: PageData } = $props();

	function buildQueryString(page: number, tags: string[], sort: string): string {
		const params = new SvelteURLSearchParams();
		if (page > 1) {
			params.set('page', String(page));
		}
		if (tags.length > 0) {
			const newTags = tags.join(',');
			console.info(`Building query string with newTags: ${newTags}`);
			params.set('tags', newTags);
		}
		if (sort !== 'date-desc') {
			params.set('sort', sort);
		}
		return params.toString() ? `?${params.toString()}` : '';
	}

	const previousPageUrl = $derived(
		`/${data.locale}/blogs${buildQueryString(data.currentPage - 1, data.currentTags, data.currentSort)}`,
	);
	const nextPageUrl = $derived(
		`/${data.locale}/blogs${buildQueryString(data.currentPage + 1, data.currentTags, data.currentSort)}`,
	);

	function sortHandler(event: Event) {
		const target = event.target as HTMLSelectElement;
		const qs = buildQueryString(1, data.currentTags, target.value);
		const url = `/${data.locale}/blogs${qs}`;
		console.log(`Navigating to: ${url}`);
		goto(resolve(url));
	}

	function filterByTag(tag: string) {
		const newTags = data.currentTags.includes(tag)
			? data.currentTags.filter((t) => t !== tag)
			: [...data.currentTags, tag];
		const qs = buildQueryString(1, newTags, data.currentSort);
		const url = `/${data.locale}/blogs${qs}`;
		console.log(`Navigating to: ${url}`);
		goto(resolve(url));
	}
</script>

<svelte:head>
	<title>{data.translations.blog.meta.title}</title>
	<meta name="description" content={data.translations.blog.meta.description} />
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
	<h1 class="mb-6 text-3xl font-bold">{data.translations.blog.title}</h1>

	<div class="mb-8 flex flex-row-reverse flex-wrap gap-4">
		<label class="flex items-center gap-2">
			<span class="font-medium">Sort:</span>
			<select
				value={data.currentSort}
				onchange={sortHandler}
				class="w-48 rounded border border-gray-300 px-3 py-2 text-sm"
			>
				<option value="date-desc">Newest First</option>
				<option value="date-asc">Oldest First</option>
			</select>
		</label>
	</div>

	{#if data.paginatedPosts.posts.length === 0}
		<p class="py-8 text-center text-gray-500">No posts found.</p>
	{:else}
		<div class="space-y-6">
			{#each data.paginatedPosts.posts as post (post.id)}
				<article
					class="rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm transition hover:shadow-md"
				>
					<div class="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
						<h2 class="flex-1 text-xl font-semibold">{post.translations[data.locale].title}</h2>
						<time datetime={post.publishedAt} class="text-sm whitespace-nowrap text-gray-600">
							{new Date(post.publishedAt).toLocaleDateString(data.locale)}
						</time>
					</div>
					<p class="mb-4 leading-relaxed text-gray-700">
						{post.translations[data.locale].excerpt}
					</p>
					<div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:text-sm">
						<span class="text-gray-600">{post.readingTimeMinutes} min read</span>
						<div class="flex flex-wrap gap-2">
							{#each post.tags as tag (tag)}
								<button
									class="cursor-pointer rounded-full bg-gray-300 px-3 py-1 text-xs font-medium"
									onclick={() => filterByTag(tag)}
								>
									{tag}
								</button>
							{/each}
						</div>
					</div>
				</article>
			{/each}
		</div>

		{#if data.paginatedPosts.totalPages > 1}
			<nav
				class="mt-8 flex items-center justify-center gap-6 border-t border-gray-200 pt-6"
				aria-label="Blog pagination"
			>
				{#if data.currentPage > 1}
					<a
						href={resolve(previousPageUrl)}
						class="rounded bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
					>
						← Previous
					</a>
				{/if}

				<span class="font-medium text-gray-900">
					Page {data.currentPage} of {data.paginatedPosts.totalPages}
				</span>

				{#if data.currentPage < data.paginatedPosts.totalPages}
					<a
						href={resolve(nextPageUrl)}
						class="rounded bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
					>
						Next →
					</a>
				{/if}
			</nav>
		{/if}
	{/if}
</section>
