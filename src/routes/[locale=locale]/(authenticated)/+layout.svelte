<script lang="ts">
	import SessionExpiryWatcher from '$lib/components/SessionExpiryWatcher.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

{@render children()}

<SessionExpiryWatcher user={data.user} locale={data.locale} translations={data.translations} />
