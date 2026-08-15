<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Button from '$lib/components/ui/Button.svelte';
	import DisplaySettings from '$lib/components/DisplaySettings.svelte';
	import { toPathname } from '$lib/utils/toPathname';
	import type { LayoutData } from './$types';

	let { data }: { data: LayoutData } = $props();
	const homeUrl = $derived(`/${data.locale}`);
	const blogUrl = $derived(`/${data.locale}/blog`);
	const loginUrl = $derived(`/${data.locale}/login`);
	const showSignInButton = $derived(!data.user && page.url.pathname !== loginUrl);
</script>

<header class="border-b border-border bg-card text-card-foreground">
	<div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
		<nav aria-label="Main" class="flex items-center gap-4">
			<a
				href={resolve(toPathname(homeUrl))}
				aria-current={page.url.pathname === homeUrl ? 'page' : undefined}
				class="rounded-sm font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				{data.translations.nav.home}
			</a>
			<a
				href={resolve(toPathname(blogUrl))}
				aria-current={page.url.pathname.startsWith(blogUrl) ? 'page' : undefined}
				class="rounded-sm text-sm font-medium transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-[current=page]:text-primary"
			>
				{data.translations.nav.blog}
			</a>
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
