<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from 'classname';

	export interface Props extends HTMLInputAttributes {
		error?: boolean;
		class?: string;
	}

	let { error = false, class: className, id, ...rest }: Props = $props();
</script>

<input
	{id}
	class={cn(
		'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
		error && 'border-destructive focus-visible:ring-destructive',
		className,
	)}
	aria-invalid={error ? 'true' : undefined}
	{...rest}
/>
