<script lang="ts">
	import DashboardSidebar from '$lib/components/dashboard/DashboardSidebar.svelte';
	import DashboardTopbar from '$lib/components/dashboard/DashboardTopbar.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<a
	href="#dashboard-main-content"
	class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
>
	Skip to content
</a>

<div class="flex h-screen overflow-hidden bg-background">
	<DashboardSidebar locale={data.locale} translations={data.translations} user={data.user} />
	<div class="flex min-w-0 flex-1 flex-col">
		<DashboardTopbar locale={data.locale} translations={data.translations} user={data.user} />
		<main id="dashboard-main-content" class="min-w-0 flex-1 overflow-y-auto">
			{@render children()}
		</main>
	</div>
</div>
