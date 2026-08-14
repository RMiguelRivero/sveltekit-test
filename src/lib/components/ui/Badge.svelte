<script lang="ts" module>
	import type { BadgeVariant } from './types';

	const variantClasses: Record<BadgeVariant, string> = {
		default: 'bg-primary/15 text-primary',
		success: 'bg-success/15 text-success',
		warning: 'bg-warning/15 text-warning',
		destructive: 'bg-destructive/15 text-destructive',
		outline: 'border border-border text-foreground',
	};

	const dotClasses: Record<BadgeVariant, string> = {
		default: 'bg-primary',
		success: 'bg-success',
		warning: 'bg-warning',
		destructive: 'bg-destructive',
		outline: 'bg-foreground',
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from 'classname';

	export interface Props extends HTMLAttributes<HTMLSpanElement> {
		variant?: BadgeVariant;
		dot?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { variant = 'default', dot = false, class: className, children, ...rest }: Props = $props();
</script>

<span
	class={cn(
		'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
		variantClasses[variant],
		className,
	)}
	{...rest}
>
	{#if dot}
		<span class={cn('h-1.5 w-1.5 rounded-full', dotClasses[variant])} aria-hidden="true"></span>
	{/if}
	{@render children?.()}
</span>
