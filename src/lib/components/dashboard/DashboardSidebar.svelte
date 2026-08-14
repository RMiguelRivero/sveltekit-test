<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import LogOut from '@lucide/svelte/icons/log-out';
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { cn } from 'classname';
	import AvatarChip from '$lib/components/ui/AvatarChip.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { getInitialSidebarCollapsed, setSidebarCollapsed } from '$lib/client/sidebar';
	import type { Translation } from '$lib/i18n/constants';
	import type { UserRole } from '$lib/schemas';
	import { capitalize } from '$lib/utils/capitalize';
	import { toPathname } from '$lib/utils/toPathname';

	interface Props {
		locale: string;
		translations: Translation;
		user: { name: string; role: UserRole };
	}

	let { locale, translations, user }: Props = $props();

	let collapsed = $state(browser ? getInitialSidebarCollapsed() : false);

	const dashboardHref = $derived(toPathname(`/${locale}/dashboard`));
	const itemsHref = $derived(toPathname(`/${locale}/dashboard/items`));

	const navLinkClasses =
		'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent';

	function toggleCollapsed(): void {
		collapsed = !collapsed;
		setSidebarCollapsed(collapsed);
	}
</script>

<aside
	class={cn(
		'hidden md:flex md:shrink-0 md:flex-col md:border-r md:border-sidebar-border md:bg-sidebar md:text-sidebar-foreground md:transition-[width] md:duration-200',
		collapsed ? 'md:w-16' : 'md:w-64',
	)}
>
	<div class="flex h-16 items-center border-b border-sidebar-border px-3">
		{#if !collapsed}
			<a
				href={resolve(toPathname(`/${locale}`))}
				class="truncate rounded-sm px-3 text-lg font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				Demo Co.
			</a>
		{/if}
		<Button
			variant="ghost"
			size="icon"
			onclick={toggleCollapsed}
			aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			aria-expanded={!collapsed}
			class={cn(
				'shrink-0 text-sidebar-foreground hover:bg-sidebar-accent',
				collapsed ? 'mx-auto' : 'ml-auto',
			)}
		>
			<ChevronLeft
				class={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
				aria-hidden="true"
			/>
		</Button>
	</div>

	<nav aria-label="Dashboard" class="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
		<a
			href={resolve(dashboardHref)}
			aria-current={page.url.pathname === dashboardHref ? 'page' : undefined}
			title={collapsed ? translations.dashboard.title : undefined}
			class={cn(
				navLinkClasses,
				collapsed && 'justify-center px-0',
				page.url.pathname === dashboardHref && 'bg-sidebar-accent text-primary',
			)}
		>
			<LayoutDashboard class="h-4 w-4 shrink-0" aria-hidden="true" />
			{#if !collapsed}
				{translations.dashboard.title}
			{/if}
		</a>
		<a
			href={resolve(itemsHref)}
			aria-current={page.url.pathname.startsWith(itemsHref) ? 'page' : undefined}
			title={collapsed ? translations.dashboard.items.title : undefined}
			class={cn(
				navLinkClasses,
				collapsed ? 'justify-center px-0' : 'ml-6',
				page.url.pathname.startsWith(itemsHref) && 'bg-sidebar-accent text-primary',
			)}
		>
			<ListChecks class="h-4 w-4 shrink-0" aria-hidden="true" />
			{#if !collapsed}
				{translations.dashboard.items.title}
			{/if}
		</a>
	</nav>

	<div class="border-t border-sidebar-border p-3">
		<div class={cn('flex items-center gap-2 rounded-md py-2', collapsed ? 'flex-col' : 'px-2')}>
			<AvatarChip name={user.name} />
			{#if !collapsed}
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-medium">{user.name}</p>
					<p class="truncate text-xs text-sidebar-foreground/60">{capitalize(user.role)}</p>
				</div>
			{/if}
			<form method="POST" action={resolve(toPathname(`/${locale}/logout`))}>
				<Button
					type="submit"
					variant="ghost"
					size="icon"
					title={collapsed ? translations.nav.logout : undefined}
					class="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent"
				>
					<LogOut class="h-4 w-4" aria-hidden="true" />
				</Button>
			</form>
		</div>
	</div>
</aside>
