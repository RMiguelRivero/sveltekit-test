<script lang="ts">
	import { page } from '$app/state';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import type { PageData } from './$types';

	const data = $derived(page.data as PageData);
	const ctaHref = $derived(`/${data.locale}/blog`);
	const pricingTiers = $derived([
		data.translations.home.pricing.tier1,
		data.translations.home.pricing.tier2,
		data.translations.home.pricing.tier3,
	]);
</script>

<section id="pricing" aria-labelledby="pricing-title" class="bg-accent py-16">
	<Container>
		<Heading level={2} id="pricing-title" class="text-center">
			{data.translations.home.pricing.title}
		</Heading>
		<div class="mt-10 grid gap-6 sm:grid-cols-3">
			{#each pricingTiers as tier, index (tier.name)}
				{@const bestChoice = 'badge' in tier}
				<Card class="flex flex-col p-6  {bestChoice ? 'scale-110' : ''}">
					<div class="flex items-center justify-between gap-2">
						<Heading level={3}>{tier.name}</Heading>
						{#if bestChoice}
							<Badge>{tier.badge}</Badge>
						{/if}
					</div>
					<p class="mt-2 text-3xl font-bold">{tier.price}</p>
					<p class="mt-2 flex-1 text-muted-foreground">{tier.description}</p>
					<Button href={ctaHref} class="mt-6" variant={index === 1 ? 'primary' : 'outline'}>
						{tier.cta}
					</Button>
				</Card>
			{/each}
		</div>
	</Container>
</section>
