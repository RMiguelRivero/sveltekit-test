<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from 'classname';

	export interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div
	class={cn('rounded-xl border border-border bg-card text-card-foreground shadow-sm', className)}
	{...rest}
>
	{@render children?.()}
</div>
