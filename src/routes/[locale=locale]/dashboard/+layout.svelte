<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { capitalize } from '$lib/utils/capitalize';
	import { toPathname } from '$lib/utils/toPathname';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const dashboardHref = $derived(toPathname(`/${data.locale}/dashboard`));
	const itemsHref = $derived(toPathname(`/${data.locale}/dashboard/items`));
</script>

<div class="border-b border-border bg-card text-card-foreground">
	<div class="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
		<nav aria-label="Dashboard" class="flex items-center gap-4">
			<a
				href={resolve(dashboardHref)}
				aria-current={page.url.pathname === dashboardHref ? 'page' : undefined}
				class="rounded-sm font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				{data.translations.dashboard.title}
			</a>
			<a
				href={resolve(itemsHref)}
				aria-current={page.url.pathname.startsWith(itemsHref) ? 'page' : undefined}
				class="rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				{data.translations.dashboard.items.title}
			</a>
		</nav>

		<div class="flex items-center gap-3">
			<span class="flex items-center gap-2 text-sm text-muted-foreground">
				{data.user.name}
				<Badge variant="outline">{capitalize(data.user.role)}</Badge>
			</span>
			<form method="POST" action={resolve(toPathname(`/${data.locale}/logout`))}>
				<Button type="submit" variant="outline" size="sm">
					{data.translations.nav.logout}
				</Button>
			</form>
		</div>
	</div>
</div>

{@render children()}
