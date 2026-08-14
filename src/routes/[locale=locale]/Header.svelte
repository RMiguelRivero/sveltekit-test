<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import { getInitialTheme, setTheme, type Theme } from '$lib/client/theme';
	import { buildLocaleHref } from '$lib/i18n/buildLocaleHref';
	import { LOCALES, LOCALE_LABELS, type Locale } from '$lib/i18n/constants';
	import { toPathname } from '$lib/utils/toPathname';
	import type { LayoutData } from './$types';

	let { data }: { data: LayoutData } = $props();

	let theme = $state<Theme>(browser ? getInitialTheme() : 'light');

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

<header class="border-b border-border bg-card text-card-foreground">
	<div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
		<nav aria-label="Main" class="flex items-center gap-4">
			<a
				href={resolve(toPathname(`/${data.locale}`))}
				aria-current={page.url.pathname === `/${data.locale}` ? 'page' : undefined}
				class="rounded-sm font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				{data.translations.nav.home}
			</a>
			<a
				href={resolve(toPathname(`/${data.locale}/blog`))}
				aria-current={page.url.pathname.startsWith(`/${data.locale}/blog`) ? 'page' : undefined}
				class="rounded-sm text-sm font-medium transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-[current=page]:text-primary"
			>
				{data.translations.nav.blog}
			</a>
			<a
				href={resolve(toPathname(`/${data.locale}/search`))}
				aria-current={page.url.pathname === `/${data.locale}/search` ? 'page' : undefined}
				class="rounded-sm text-sm font-medium transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-[current=page]:text-primary"
			>
				{data.translations.nav.search}
			</a>
			{#if data.user}
				<a
					href={resolve(toPathname(`/${data.locale}/dashboard`))}
					aria-current={page.url.pathname === `/${data.locale}/dashboard` ? 'page' : undefined}
					class="rounded-sm text-sm font-medium transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-[current=page]:text-primary"
				>
					{data.translations.nav.dashboard}
				</a>
				<form method="POST" action={resolve(toPathname(`/${data.locale}/logout`))}>
					<button
						type="submit"
						class="rounded-sm text-sm font-medium transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-[current=page]:text-primary"
					>
						{data.translations.nav.logout}
					</button>
				</form>
			{:else}
				<a
					href={resolve(toPathname(`/${data.locale}/login`))}
					aria-current={page.url.pathname === `/${data.locale}/login` ? 'page' : undefined}
					class="rounded-sm text-sm font-medium transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-[current=page]:text-primary"
				>
					{data.translations.nav.login}
				</a>
			{/if}
		</nav>

		<div class="flex items-center gap-3">
			<label class="flex items-center gap-2 text-sm">
				<span class="sr-only">Locale</span>
				<select
					value={data.locale}
					onchange={handleLocaleChange}
					class="rounded-md border border-border bg-background px-2 py-1 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				>
					{#each LOCALES as locale (locale)}
						<option value={locale}>{LOCALE_LABELS[locale]}</option>
					{/each}
				</select>
			</label>

			<button
				type="button"
				onclick={toggleTheme}
				aria-label="Toggle theme"
				class="rounded-md border border-border p-1.5 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				{#if theme === 'dark'}
					<Sun class="h-4 w-4" aria-hidden="true" />
				{:else}
					<Moon class="h-4 w-4" aria-hidden="true" />
				{/if}
			</button>
		</div>
	</div>
</header>
