<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import DisplaySettings from '$lib/components/DisplaySettings.svelte';
	import { toPathname } from '$lib/utils/toPathname';
	import type { LayoutData } from './$types';

	let { data }: { data: LayoutData } = $props();
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

		<DisplaySettings />
	</div>
</header>
