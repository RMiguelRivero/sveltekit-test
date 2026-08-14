<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import AvatarChip from '$lib/components/ui/AvatarChip.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { getInitialTheme, setTheme, type Theme } from '$lib/client/theme';
	import { buildLocaleHref } from '$lib/i18n/buildLocaleHref';
	import { LOCALES, LOCALE_LABELS, type Locale, type Translation } from '$lib/i18n/constants';
	import { toPathname } from '$lib/utils/toPathname';

	interface Props {
		locale: string;
		translations: Translation;
		user: { name: string };
	}

	let { locale, translations, user }: Props = $props();

	let theme = $state<Theme>(browser ? getInitialTheme() : 'light');

	const dashboardHref = $derived(toPathname(`/${locale}/dashboard`));
	const itemsHref = $derived(toPathname(`/${locale}/dashboard/items`));

	function handleLocaleChange(event: Event): void {
		const target = event.target as HTMLSelectElement;
		const href = buildLocaleHref(page.url.pathname, page.url.search, target.value as Locale);
		goto(resolve(toPathname(href)));
	}

	function toggleTheme(): void {
		const next: Theme = theme === 'dark' ? 'light' : 'dark';
		theme = next;
		setTheme(next);
	}
</script>

<div class="flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4">
	<nav aria-label="Dashboard" class="flex items-center gap-4 md:hidden">
		<a
			href={resolve(dashboardHref)}
			aria-current={page.url.pathname === dashboardHref ? 'page' : undefined}
			class="flex items-center gap-1.5 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
		>
			<LayoutDashboard class="h-4 w-4" aria-hidden="true" />
			{translations.dashboard.title}
		</a>
		<a
			href={resolve(itemsHref)}
			aria-current={page.url.pathname.startsWith(itemsHref) ? 'page' : undefined}
			class="flex items-center gap-1.5 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
		>
			<ListChecks class="h-4 w-4" aria-hidden="true" />
			{translations.dashboard.items.title}
		</a>
	</nav>

	<div class="ml-auto flex items-center gap-3">
		<label class="flex items-center gap-2 text-sm">
			<span class="sr-only">Locale</span>
			<select
				value={locale}
				onchange={handleLocaleChange}
				class="rounded-md border border-border bg-background px-2 py-1 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				{#each LOCALES as localeOption (localeOption)}
					<option value={localeOption}>{LOCALE_LABELS[localeOption]}</option>
				{/each}
			</select>
		</label>

		<Button variant="ghost" size="icon" onclick={toggleTheme} aria-label="Toggle theme">
			{#if theme === 'dark'}
				<Sun class="h-4 w-4" aria-hidden="true" id="sun" />
			{:else}
				<Sun class="h-4 w-4" aria-hidden="true" id="sun" />
				<Moon class="h-4 w-4" aria-hidden="true" id="moon" />
			{/if}
		</Button>

		<div class="flex items-center gap-3 md:hidden">
			<div class="hidden items-center gap-2 sm:flex">
				<AvatarChip name={user.name} />
				<span class="text-sm text-muted-foreground">{user.name}</span>
			</div>

			<form method="POST" action={resolve(toPathname(`/${locale}/logout`))}>
				<Button type="submit" variant="outline" size="sm" title={translations.nav.logout}>
					<LogOut class="h-4 w-4" aria-hidden="true" />
					<span class="hidden sm:inline">{translations.nav.logout}</span>
				</Button>
			</form>
		</div>
	</div>
</div>
