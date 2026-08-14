<script lang="ts">
	import Menu from '@lucide/svelte/icons/menu';
	import Button from '$lib/components/ui/Button.svelte';
	import DisplaySettings from '$lib/components/DisplaySettings.svelte';

	interface Props {
		onOpenMobileNav: () => void;
	}

	let { onOpenMobileNav }: Props = $props();
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

	<DisplaySettings class="ml-auto" />
</div>
