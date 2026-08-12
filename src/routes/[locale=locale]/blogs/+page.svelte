<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.translations.blog.meta.title}</title>
	<meta name="description" content={data.translations.blog.meta.description} />
</svelte:head>

<section>
	<h1>{data.translations.blog.title}</h1>
	<pre>{JSON.stringify(data, null, 2)}</pre>
	<p>Blog listing will be implemented here.</p>
</section>

<style>
	section {
		padding: 1rem;
		max-width: 60rem;
		margin: 0 auto;
	}
</style>
