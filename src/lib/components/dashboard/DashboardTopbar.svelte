<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Menu from '@lucide/svelte/icons/menu';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import Button from '$lib/components/ui/Button.svelte';
	import { getInitialTheme, setTheme, type Theme } from '$lib/client/theme';
	import { buildLocaleHref } from '$lib/i18n/buildLocaleHref';
	import { LOCALES, LOCALE_LABELS, type Locale } from '$lib/i18n/constants';
	import { toPathname } from '$lib/utils/toPathname';

	interface Props {
		locale: string;
		onOpenMobileNav: () => void;
	}

	let { locale, onOpenMobileNav }: Props = $props();

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

<div class="flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4">
	<Button
		variant="ghost"
		size="icon"
		onclick={onOpenMobileNav}
		aria-label="Open menu"
		class="md:hidden"
	>
		<Menu class="h-5 w-5" aria-hidden="true" />
	</Button>

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
				<Sun class="h-4 w-4" aria-hidden="true" />
			{:else}
				<Moon class="h-4 w-4" aria-hidden="true" />
			{/if}
		</Button>
	</div>
</div>
