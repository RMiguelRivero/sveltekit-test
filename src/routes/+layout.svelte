<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import './layout.css';
	import { initWebVitals } from '$lib/client/rum';
	import { RUM_SAMPLE_RATE } from '$lib/client/rum.constants';

	let { children } = $props();

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	onMount(() => {
		initWebVitals({ sampleRate: RUM_SAMPLE_RATE });
	});
</script>

{@render children()}
