<script lang="ts">
	import { page } from '$app/state';
	import Card from '$lib/components/ui/Card.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import type { PageData } from '../../../routes/[locale=locale]/$types';

	const data = $derived(page.data as PageData);
	const features = $derived([
		data.translations.home.features.item1,
		data.translations.home.features.item2,
		data.translations.home.features.item3,
	]);
</script>

<section aria-labelledby="features-title" class="py-16">
	<Container>
		<Heading level={2} id="features-title" class="text-center">
			{data.translations.home.features.title}
		</Heading>
		<div class="mt-10 grid gap-6 sm:grid-cols-3">
			{#each features as feature (feature.title)}
				<Card class="p-6">
					<Heading level={3}>{feature.title}</Heading>
					<p class="mt-2 text-muted-foreground">{feature.description}</p>
				</Card>
			{/each}
		</div>
	</Container>
</section>
