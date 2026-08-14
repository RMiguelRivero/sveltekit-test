<script lang="ts">
	import { onMount } from 'svelte';
	import './layout.css';
	import { initWebVitals } from '$lib/client/rum';
	import { RUM_SAMPLE_RATE } from '$lib/client/rum.constants';

	let { children } = $props();

	onMount(() => {
		initWebVitals({ sampleRate: RUM_SAMPLE_RATE });
	});
</script>

{@render children()}
