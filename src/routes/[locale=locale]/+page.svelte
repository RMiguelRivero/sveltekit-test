<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import HeroBanner from './HeroBanner.svelte';
	import Pricing from './Pricing.svelte';
	import type { PageData } from './$types';
	import { jsonLdScriptTag } from '$lib/utils/jsonLd';

	interface OrganizationJsonLd {
		'@context': 'https://schema.org';
		'@type': 'Organization';
		name: string;
		url: string;
		logo: string;
	}

	function buildOrganizationJsonLd(origin: string): OrganizationJsonLd {
		return {
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: 'Demo Co.',
			url: origin,
			logo: `${origin}/favicon.svg`,
		};
	}

	let { data }: { data: PageData } = $props();

	const features = $derived([
		data.translations.home.features.item1,
		data.translations.home.features.item2,
		data.translations.home.features.item3,
	]);
	const quotes = $derived([
		data.translations.home.social.quote1,
		data.translations.home.social.quote2,
	]);
	const organizationJsonLd = $derived(buildOrganizationJsonLd(data.origin));
</script>

<Seo
	title={data.translations.home.meta.title}
	description={data.translations.home.meta.description}
	locale={data.locale}
	origin={data.origin}
	path=""
/>

<svelte:head>
	<!-- eslint-disable svelte/no-at-html-tags -- server-built JSON-LD, escaped in jsonLdScriptTag to prevent </script> breakout -->
	{@html jsonLdScriptTag(organizationJsonLd)}
	<!-- eslint-enable svelte/no-at-html-tags -->
</svelte:head>

<HeroBanner />

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

<Pricing />

<section aria-labelledby="social-title" class="py-16">
	<Container size="md">
		<Heading level={2} id="social-title" class="text-center">
			{data.translations.home.social.title}
		</Heading>
		<div class="mt-10 grid gap-6 sm:grid-cols-2">
			{#each quotes as quote (quote.author)}
				<Card class="p-6">
					<blockquote class="text-lg">
						<p>&ldquo;{quote.text}&rdquo;</p>
						<cite class="mt-4 block text-sm text-muted-foreground not-italic">{quote.author}</cite>
					</blockquote>
				</Card>
			{/each}
		</div>
	</Container>
</section>
