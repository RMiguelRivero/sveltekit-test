<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from 'classname';

	export interface Props extends Omit<HTMLInputAttributes, 'value'> {
		error?: boolean;
		class?: string;
		value?: HTMLInputAttributes['value'];
	}

	let { error = false, class: className, id, value = $bindable(), ...rest }: Props = $props();
</script>

<input
	{id}
	bind:value
	class={cn(
		'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
		error && 'border-destructive focus-visible:ring-destructive',
		className,
	)}
	aria-invalid={error ? 'true' : undefined}
	{...rest}
/>
