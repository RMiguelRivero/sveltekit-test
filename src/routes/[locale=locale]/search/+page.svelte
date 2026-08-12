<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.translations.search.meta.title}</title>
	<meta name="description" content={data.translations.search.meta.description} />
</svelte:head>

<section>
	<h1>{data.translations.search.title}</h1>
	<!-- <p>{data.translations.search.description}</p> -->
	<p>Search UI and URL-driven filters will be implemented here.</p>
</section>

<style>
	section {
		padding: 1rem;
		max-width: 60rem;
		margin: 0 auto;
	}
</style>
