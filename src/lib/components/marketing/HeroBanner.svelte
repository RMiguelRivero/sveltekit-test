<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import type { Translation } from '$lib/i18n/constants';

	let {
		translations,
		ctaHref,
	}: {
		translations: Translation['home']['hero'];
		ctaHref: string;
	} = $props();
</script>

<section aria-labelledby="hero-title" class=" bg-accent py-16 text-center sm:py-24">
	<Container size="md">
		<Heading level={1} id="hero-title">{translations.title}</Heading>
		<p class="mt-4 text-lg text-muted-foreground">{translations.subtitle}</p>
		<div class="mt-8">
			<Button href={ctaHref} size="lg">{translations.cta}</Button>
		</div>
	</Container>
</section>
