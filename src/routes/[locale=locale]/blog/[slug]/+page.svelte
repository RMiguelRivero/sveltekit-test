<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	let post = $derived(data.post);
	let initials = $derived(
		post.author.name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase(),
	);
</script>

<section class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="space-y-6">
		<article
			class="rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm transition hover:shadow-md"
		>
			<h1 class="flex-1 text-xl font-semibold">{post.translations[data.locale].title}</h1>
			<div
				class="mb-4 flex flex-col items-center justify-between gap-2 sm:flex-row sm:items-center"
			>
				<div
					class="grow-0 rounded-2xl border-0 bg-gray-300 p-1"
					style:background-color={post.author.avatarColor}
				>
					{initials}
				</div>
				<p class="flex grow">{post.author.name}</p>
				<time datetime={post.publishedAt} class="text-sm whitespace-nowrap text-gray-600">
					{new Date(post.publishedAt).toLocaleDateString(data.locale)}
				</time>
			</div>

			<p class="mb-4 leading-relaxed text-gray-700">
				{post.translations[data.locale].body}
			</p>
			<div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:text-sm">
				<span class="text-gray-600">{post.readingTimeMinutes} min read</span>
				<div class="flex flex-wrap gap-2">
					{#each post.tags as tag (tag)}
						<div class="rounded-full bg-gray-300 px-3 py-1 text-xs font-medium">
							{tag}
						</div>
					{/each}
				</div>
			</div>
		</article>
	</div>
</section>
