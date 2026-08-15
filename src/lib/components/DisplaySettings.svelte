<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import { cn } from 'classname';
	import Button from '$lib/components/ui/Button.svelte';
	import { getInitialTheme, setTheme, type Theme } from '$lib/client/theme';
	import { buildLocaleHref } from '$lib/i18n/buildLocaleHref';
	import { LOCALES, LOCALE_LABELS, type Locale } from '$lib/i18n/constants';
	import { toPathname } from '$lib/utils/toPathname';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();

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

<div class={cn('flex items-center gap-3', className)}>
	<label class="flex items-center gap-2 text-sm">
		<span class="sr-only">Locale</span>
		<select
			value={page.data.locale}
			onchange={handleLocaleChange}
			class="appearance-none rounded-md border border-border bg-background bg-none px-2 py-1 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
		>
			{#each LOCALES as localeOption (localeOption)}
				<option value={localeOption} class="bg-background text-foreground"
					>{LOCALE_LABELS[localeOption]}</option
				>
			{/each}
		</select>
	</label>

	<Button variant="ghost" size="icon" onclick={toggleTheme} aria-label="Toggle theme">
		<Sun class="h-4 w-4 dark:hidden" aria-hidden="true" />
		<Moon class="hidden h-4 w-4 dark:inline-block" aria-hidden="true" />
	</Button>
</div>
