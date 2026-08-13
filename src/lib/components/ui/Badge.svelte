<script lang="ts" module>
	import type { BadgeVariant } from './types';

	const variantClasses: Record<BadgeVariant, string> = {
		default: 'bg-primary text-primary-foreground',
		success: 'bg-success text-success-foreground',
		warning: 'bg-warning text-warning-foreground',
		destructive: 'bg-destructive text-destructive-foreground',
		outline: 'border border-border text-foreground',
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from 'classname';

	export interface Props extends HTMLAttributes<HTMLSpanElement> {
		variant?: BadgeVariant;
		class?: string;
		children?: Snippet;
	}

	let { variant = 'default', class: className, children, ...rest }: Props = $props();
</script>

<span
	class={cn(
		'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
		variantClasses[variant],
		className,
	)}
	{...rest}
>
	{@render children?.()}
</span>
