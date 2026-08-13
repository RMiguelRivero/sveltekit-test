<script lang="ts" module>
	import type { HeadingLevel } from './types';

	const levelClasses: Record<HeadingLevel, string> = {
		1: 'text-4xl font-bold tracking-tight',
		2: 'text-3xl font-bold tracking-tight',
		3: 'text-2xl font-semibold tracking-tight',
		4: 'text-xl font-semibold tracking-tight',
		5: 'text-lg font-semibold',
		6: 'text-base font-semibold',
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from 'classname';

	export interface Props extends HTMLAttributes<HTMLHeadingElement> {
		level: HeadingLevel;
		class?: string;
		children?: Snippet;
	}

	let { level, class: className, children, ...rest }: Props = $props();

	const tag = $derived(`h${level}` as const);
</script>

<svelte:element this={tag} class={cn(levelClasses[level], className)} {...rest}>
	{@render children?.()}
</svelte:element>
