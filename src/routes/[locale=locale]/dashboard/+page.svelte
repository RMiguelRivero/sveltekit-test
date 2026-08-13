<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import { toPathname } from '$lib/utils/toPathname';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.translations.dashboard.meta.title}</title>
	<meta name="description" content={data.translations.dashboard.meta.description} />
	<meta name="robots" content="noindex" />
</svelte:head>

<Container size="md" class="py-8">
	<Heading level={1} class="mb-6">
		{data.translations.dashboard.welcome.replace('{name}', data.user.name)}
	</Heading>

	<Card class="p-6">
		<p class="mb-4 text-muted-foreground">{data.translations.dashboard.items.title}</p>
		<Button href={resolve(toPathname(`/${data.locale}/dashboard/items`))} variant="primary">
			{data.translations.dashboard.viewItems}
		</Button>
	</Card>
</Container>
