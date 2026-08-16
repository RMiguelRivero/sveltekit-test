<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Button from '$lib/components/ui/Button.svelte';
	import DisplaySettings from '$lib/components/DisplaySettings.svelte';
	import { isPathActive } from '$lib/utils/isPathActive';
	import { toPathname } from '$lib/utils/toPathname';
	import type { Translation } from '$lib/i18n/constants';

	type NavLink = {
		href: string;
		matchUrl: string;
		exact: boolean;
		label: string;
	};

	const navLinkClass = 'aria-[current=page]:font-bold aria-[current=page]:text-primary';

	let {
		locale,
		isAuthenticated,
		translations,
	}: {
		locale: string;
		isAuthenticated: boolean;
		translations: Translation['nav'];
	} = $props();

	const homeUrl = $derived(`/${locale}`);
	const blogUrl = $derived(`/${locale}/blog`);
	const loginUrl = $derived(`/${locale}/login`);
	const showSignInButton = $derived(!isAuthenticated && page.url.pathname !== loginUrl);

	const navLinks = $derived<NavLink[]>([
		{
			href: resolve(toPathname(homeUrl)),
			matchUrl: homeUrl,
			exact: true,
			label: translations.home,
		},
		{
			href: resolve(toPathname(blogUrl)),
			matchUrl: blogUrl,
			exact: false,
			label: translations.blog,
		},
	]);
</script>

<header class="border-b border-border bg-card text-card-foreground">
	<div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
		<nav aria-label="Main" class="flex items-center gap-4">
			{#each navLinks as link (link.href)}
				<Button
					href={link.href}
					aria-current={isPathActive(page.url.pathname, link.matchUrl, link.exact)
						? 'page'
						: undefined}
					variant="ghost"
					class={navLinkClass}
				>
					{link.label}
				</Button>
			{/each}
		</nav>

		<div class="flex items-center gap-3">
			<DisplaySettings />
			{#if showSignInButton}
				<Button href={resolve(toPathname(loginUrl))} size="sm">
					{translations.login}
				</Button>
			{/if}
		</div>
	</div>
</header>
