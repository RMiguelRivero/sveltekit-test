<script lang="ts">
	import Footer from './Footer.svelte';
	import Header from './Header.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<a
	href="#main-content"
	class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
>
	Skip to content
</a>

<Header {data} />

<main id="main-content" class="mx-auto w-full max-w-5xl px-4 py-8">
	{@render children()}
</main>

<Footer {data} />

<Toast />
