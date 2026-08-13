<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { toPathname } from '$lib/utils/toPathname';

	let homeHref = $derived(resolve(toPathname('/en')));
</script>

<!--
	Fallback for errors outside the locale subtree (e.g. the root `/` redirect
	failing before a locale is known). Can't infer the visitor's intended
	locale here, so this stays hardcoded to English rather than reading
	`data.translations` like the locale-scoped error page does.
-->
<div
	class="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center text-foreground"
>
	<h1 class="text-4xl font-bold tracking-tight">{page.status}</h1>
	<p class="text-muted-foreground">{page.error?.message ?? 'Something went wrong.'}</p>
	<a href={homeHref} class="text-primary hover:underline">Back to home</a>
</div>
