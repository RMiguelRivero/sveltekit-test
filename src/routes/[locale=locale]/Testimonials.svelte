<script lang="ts">
	import { page } from '$app/state';
	import Card from '$lib/components/ui/Card.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import type { PageData } from './$types';

	const data = $derived(page.data as PageData);
	const quotes = $derived([
		data.translations.home.social.quote1,
		data.translations.home.social.quote2,
	]);
</script>

<section aria-labelledby="social-title" class="py-16">
	<Container size="md">
		<Heading level={2} id="social-title" class="text-center">
			{data.translations.home.social.title}
		</Heading>
		<div class="mt-10 grid gap-6 sm:grid-cols-2">
			{#each quotes as quote (quote.author)}
				<Card class="relative p-6">
					<blockquote
						class="text-lg before:absolute before:top-4 before:text-8xl before:text-accent before:content-['“']"
					>
						<p class="ml-12 block">{quote.text}</p>
					</blockquote>
					<cite class="mt-4 block text-sm text-muted-foreground not-italic">{quote.author}</cite>
				</Card>
			{/each}
		</div>
	</Container>
</section>
