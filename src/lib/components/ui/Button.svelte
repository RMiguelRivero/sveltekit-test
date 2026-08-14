<script lang="ts" module>
	import type { ButtonSize, ButtonVariant } from './types';

	const baseClasses =
		'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';

	const variantClasses: Record<ButtonVariant, string> = {
		primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md',
		secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
		outline:
			'border border-border bg-background text-foreground hover:border-primary/40 hover:bg-accent hover:text-accent-foreground',
		ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
		destructive:
			'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md',
	};

	const sizeClasses: Record<ButtonSize, string> = {
		sm: 'h-8 px-3 text-sm',
		md: 'h-10 px-4 text-sm',
		lg: 'h-12 px-6 text-base',
		icon: 'h-10 w-10 p-0',
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from 'classname';

	export interface Props extends Omit<HTMLButtonAttributes, 'type' | 'disabled' | 'class'> {
		variant?: ButtonVariant;
		size?: ButtonSize;
		href?: string;
		target?: HTMLAnchorAttributes['target'];
		rel?: HTMLAnchorAttributes['rel'];
		type?: HTMLButtonAttributes['type'];
		title?: HTMLButtonAttributes['title'];
		disabled?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		href,
		target,
		rel,
		type = 'button',
		title,
		disabled,
		class: className,
		children,
		...rest
	}: Props = $props();

	const classes = $derived(cn(baseClasses, variantClasses[variant], sizeClasses[size], className));
</script>

{#if href}
	<!-- eslint-disable svelte/no-navigation-without-resolve -- href is caller-resolved: this primitive accepts internal, external, and mailto links alike -->
	<a
		{href}
		{target}
		{rel}
		class={classes}
		aria-disabled={disabled ? 'true' : undefined}
		aria-label={title}
		{title}
		tabindex={disabled ? -1 : undefined}
		{...rest as Record<string, unknown>}
	>
		{@render children?.()}
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{:else}
	<button {type} {disabled} class={classes} {...rest}>
		{@render children?.()}
	</button>
{/if}
