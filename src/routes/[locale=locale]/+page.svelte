<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Features from './Features.svelte';
	import HeroBanner from './HeroBanner.svelte';
	import Pricing from './Pricing.svelte';
	import Testimonials from './Testimonials.svelte';
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

<Features />

<Pricing />

<Testimonials />
