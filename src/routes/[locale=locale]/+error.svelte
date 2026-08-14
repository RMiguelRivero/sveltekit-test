<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import { toPathname } from '$lib/utils/toPathname';
	import type { PageData } from './$types';

	// `valid-prop-names-in-kit-pages` expects `error` here, but that assumes the
	// `experimental.handleRenderingErrors` boundary path, which this project doesn't
	// enable (verified against the generated .svelte-kit/generated/root.svelte): every
	// depth, error page included, is rendered with `data`/`form`/`params`, never `error`.
	// eslint-disable-next-line svelte/valid-prop-names-in-kit-pages
	let { data }: { data: PageData } = $props();

	let isNotFound = $derived(page.status === 404);
	let homeHref = $derived(resolve(toPathname(`/${data.locale}`)));
	let blogHref = $derived(resolve(toPathname(`/${data.locale}/blog`)));

	function retry(): void {
		window.location.reload();
	}
</script>

<Container size="md" class="py-16">
	<Card class="mx-auto max-w-md p-8 text-center">
		{#if isNotFound}
			<Heading level={1} class="mb-4">{data.translations.error.notFound.title}</Heading>
			<p class="mb-6 text-muted-foreground">{data.translations.error.notFound.description}</p>
			<div class="flex justify-center gap-4">
				<Button href={homeHref} variant="primary">{data.translations.error.backHome}</Button>
				<Button href={blogHref} variant="outline">{data.translations.blog.backToBlog}</Button>
			</div>
		{:else}
			<Heading level={1} class="mb-4">{data.translations.common.error.generic}</Heading>
			{#if page.error?.message}
				<p class="mb-6 text-muted-foreground">{page.error.message}</p>
			{/if}
			<div class="flex justify-center gap-4">
				<Button onclick={retry} variant="primary">{data.translations.common.retry}</Button>
				<Button href={homeHref} variant="outline">{data.translations.error.backHome}</Button>
			</div>
		{/if}
	</Card>
</Container>
