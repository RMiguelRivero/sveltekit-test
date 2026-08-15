<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/ui/Button.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import type { PageData } from './$types';

	const data = $derived(page.data as PageData);
	const hero = $derived(data.translations.home.hero);
	const ctaHref = $derived(`/${data.locale}/blog`);
</script>

<section aria-labelledby="hero-title" class="py-16 text-center sm:py-24">
	<Container size="md">
		<Heading level={1} id="hero-title">{hero.title}</Heading>
		<p class="mt-4 text-lg text-muted-foreground">{hero.subtitle}</p>
		<div class="mt-8">
			<Button href={ctaHref} size="lg">{hero.cta}</Button>
		</div>
		<img
			src="/images/hero/hero-banner-light.webp"
			alt=""
			class="mx-auto mt-12 w-full max-w-3xl rounded-xl dark:hidden"
		/>
		<img
			src="/images/hero/hero-banner-dark.webp"
			alt=""
			class="mx-auto mt-12 hidden w-full max-w-3xl rounded-xl dark:block"
		/>
	</Container>
</section>
