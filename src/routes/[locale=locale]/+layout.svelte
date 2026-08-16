<script lang="ts">
	import { page } from '$app/state';
	import Footer from '$lib/components/marketing/Footer.svelte';
	import Header from '$lib/components/marketing/Header.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// The dashboard subtree supplies its own full-bleed sidebar shell
	// (`dashboard/+layout.svelte`), incompatible with this centered marketing
	// chrome — skip Header/Footer/the max-w-5xl wrapper there instead of nesting
	// two navs. `<Toast/>` stays mounted here regardless, since it's shared.
	const isDashboard = $derived(page.url.pathname.startsWith(`/${data.locale}/dashboard`));
</script>

{#if isDashboard}
	{@render children()}
{:else}
	<a
		href="#main-content"
		class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
	>
		Skip to content
	</a>

	<Header locale={data.locale} isAuthenticated={!!data.user} translations={data.translations.nav} />

	<main id="main-content" class="mx-auto w-full max-w-5xl px-4 py-8">
		{@render children()}
	</main>

	<Footer copy={data.translations.footer.copy} />
{/if}

<Toast />
