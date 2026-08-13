<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { LOCALES, LOCALE_LABELS, type Locale } from '$lib/i18n/constants';
	import { toPathname } from '$lib/utils/toPathname';
	import type { LayoutData } from './$types';

	let { data }: { data: LayoutData } = $props();

	let theme = $state<'light' | 'dark'>(
		browser && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
	);

	function buildLocaleHref(locale: Locale): string {
		const segments = page.url.pathname.split('/');
		segments[1] = locale;
		return `${segments.join('/')}${page.url.search}`;
	}

	function handleLocaleChange(event: Event): void {
		const target = event.target as HTMLSelectElement;
		goto(resolve(toPathname(buildLocaleHref(target.value as Locale))));
	}

	function toggleTheme(): void {
		const next = theme === 'dark' ? 'light' : 'dark';
		theme = next;
		document.documentElement.dataset.theme = next;
		localStorage.setItem('theme', next);
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
				class="rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				{data.translations.nav.blog}
			</a>
			<a
				href={resolve(toPathname(`/${data.locale}/search`))}
				aria-current={page.url.pathname === `/${data.locale}/search` ? 'page' : undefined}
				class="rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				{data.translations.nav.search}
			</a>
			<a
				href={resolve(toPathname(`/${data.locale}/login`))}
				aria-current={page.url.pathname === `/${data.locale}/login` ? 'page' : undefined}
				class="rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				{data.translations.nav.login}
			</a>
		</nav>

		<div class="flex items-center gap-3">
			<label class="flex items-center gap-2 text-sm">
				<span class="sr-only">Locale</span>
				<select
					value={data.locale}
					onchange={handleLocaleChange}
					class="rounded-sm border border-border bg-background px-2 py-1 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
				class="rounded-sm border border-border px-2 py-1 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				{theme === 'dark' ? '🌙' : '☀️'}
			</button>
		</div>
	</div>
</header>
