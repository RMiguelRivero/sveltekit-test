<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import type { Translation } from '$lib/i18n/constants';

	let { translations }: { translations: Translation['home']['features'] } = $props();

	const features = $derived([translations.item1, translations.item2, translations.item3]);
</script>

<section aria-labelledby="features-title" class="py-16">
	<Container>
		<Heading level={2} id="features-title" class="text-center">
			{translations.title}
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
