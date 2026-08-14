<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import LogOut from '@lucide/svelte/icons/log-out';
	import X from '@lucide/svelte/icons/x';
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { cn } from 'classname';
	import { fade, fly } from 'svelte/transition';
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
		mobileOpen: boolean;
		onCloseMobile: () => void;
	}

	let { locale, translations, user, mobileOpen, onCloseMobile }: Props = $props();

	let collapsed = $state(browser ? getInitialSidebarCollapsed() : false);
	let mobileDrawerEl: HTMLElement | undefined = $state();

	const dashboardHref = $derived(toPathname(`/${locale}/dashboard`));
	const itemsHref = $derived(toPathname(`/${locale}/dashboard/items`));

	const navLinkClasses =
		'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent';

	function toggleCollapsed(): void {
		collapsed = !collapsed;
		setSidebarCollapsed(collapsed);
	}

	$effect(() => {
		if (mobileOpen) {
			mobileDrawerEl?.focus();
		}
	});
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

{#if mobileOpen}
	<!-- Decorative scrim: click-to-dismiss is a supplementary mouse/touch affordance, not the
		keyboard path — Escape (window-level, in the parent layout) and the explicit close
		button below already give keyboard/AT users full equivalent control. role="presentation"
		below is what satisfies the a11y linters here (no separate svelte-ignore needed). -->
	<div
		class="fixed inset-0 z-40 bg-foreground/50 md:hidden"
		role="presentation"
		onclick={onCloseMobile}
		transition:fade={{ duration: 150 }}
	></div>

	<div
		bind:this={mobileDrawerEl}
		tabindex="-1"
		role="dialog"
		aria-modal="true"
		aria-label="Navigation menu"
		class="fixed inset-y-0 left-0 z-50 flex w-4/5 flex-col bg-sidebar text-sidebar-foreground shadow-xl outline-none md:hidden"
		transition:fly={{ x: -320, duration: 200 }}
	>
		<div class="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
			<a
				href={resolve(toPathname(`/${locale}`))}
				onclick={onCloseMobile}
				class="rounded-sm text-lg font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				Demo Co.
			</a>
			<Button
				variant="ghost"
				size="icon"
				onclick={onCloseMobile}
				aria-label="Close menu"
				class="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent"
			>
				<X class="h-5 w-5" aria-hidden="true" />
			</Button>
		</div>

		<nav aria-label="Dashboard" class="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
			<a
				href={resolve(dashboardHref)}
				onclick={onCloseMobile}
				aria-current={page.url.pathname === dashboardHref ? 'page' : undefined}
				class={cn(
					navLinkClasses,
					page.url.pathname === dashboardHref && 'bg-sidebar-accent text-primary',
				)}
			>
				<LayoutDashboard class="h-4 w-4 shrink-0" aria-hidden="true" />
				{translations.dashboard.title}
			</a>
			<a
				href={resolve(itemsHref)}
				onclick={onCloseMobile}
				aria-current={page.url.pathname.startsWith(itemsHref) ? 'page' : undefined}
				class={cn(
					navLinkClasses,
					'ml-6',
					page.url.pathname.startsWith(itemsHref) && 'bg-sidebar-accent text-primary',
				)}
			>
				<ListChecks class="h-4 w-4 shrink-0" aria-hidden="true" />
				{translations.dashboard.items.title}
			</a>
		</nav>

		<div class="border-t border-sidebar-border p-3">
			<div class="flex items-center gap-2 rounded-md px-2 py-2">
				<AvatarChip name={user.name} />
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-medium">{user.name}</p>
					<p class="truncate text-xs text-sidebar-foreground/60">{capitalize(user.role)}</p>
				</div>
				<form method="POST" action={resolve(toPathname(`/${locale}/logout`))}>
					<Button
						type="submit"
						variant="ghost"
						size="icon"
						title={translations.nav.logout}
						class="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent"
					>
						<LogOut class="h-4 w-4" aria-hidden="true" />
					</Button>
				</form>
			</div>
		</div>
	</div>
{/if}
