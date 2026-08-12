<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<!-- <title>{data.translations.home.title}</title>
	<meta name="description" content={data.translations.home.description} /> -->
</svelte:head>

{@render children()}
