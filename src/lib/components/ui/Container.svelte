<script lang="ts" module>
	import type { ContainerSize } from './types';

	const sizeClasses: Record<ContainerSize, string> = {
		sm: 'max-w-2xl',
		md: 'max-w-4xl',
		lg: 'max-w-5xl',
		full: 'max-w-none',
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from 'classname';

	export interface Props extends HTMLAttributes<HTMLDivElement> {
		size?: ContainerSize;
		class?: string;
		children?: Snippet;
	}

	let { size = 'lg', class: className, children, ...rest }: Props = $props();
</script>

<div class={cn('mx-auto w-full px-4', sizeClasses[size], className)} {...rest}>
	{@render children?.()}
</div>
