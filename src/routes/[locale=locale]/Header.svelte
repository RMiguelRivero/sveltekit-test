<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Button from '$lib/components/ui/Button.svelte';
	import DisplaySettings from '$lib/components/DisplaySettings.svelte';
	import { isPathActive } from '$lib/utils/isPathActive';
	import { toPathname } from '$lib/utils/toPathname';
	import type { LayoutData } from './$types';

	type NavLink = {
		href: string;
		matchUrl: string;
		exact: boolean;
		label: string;
	};

	const navLinkClass = 'aria-[current=page]:font-bold aria-[current=page]:text-primary';

	let { data }: { data: LayoutData } = $props();
	const homeUrl = $derived(`/${data.locale}`);
	const blogUrl = $derived(`/${data.locale}/blog`);
	const loginUrl = $derived(`/${data.locale}/login`);
	const dashboardUrl = $derived(`/${data.locale}/dashboard`);
	const showSignInButton = $derived(!data.user && page.url.pathname !== loginUrl);

	const navLinks = $derived<NavLink[]>([
		{
			href: resolve(toPathname(homeUrl)),
			matchUrl: homeUrl,
			exact: true,
			label: data.translations.nav.home,
		},
		{
			href: resolve(toPathname(blogUrl)),
			matchUrl: blogUrl,
			exact: false,
			label: data.translations.nav.blog,
		},
		...(data.user
			? [
					{
						href: resolve(toPathname(dashboardUrl)),
						matchUrl: dashboardUrl,
						exact: true,
						label: data.translations.nav.dashboard,
					},
				]
			: []),
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
					{data.translations.nav.login}
				</Button>
			{/if}
		</div>
	</div>
</header>
