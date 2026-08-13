<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { cn } from 'classname';

	export interface Props extends HTMLSelectAttributes {
		class?: string;
		children?: Snippet;
	}

	let { class: className, id, children, ...rest }: Props = $props();
</script>

<select
	{id}
	class={cn(
		'block w-full rounded-md border-border bg-background text-sm text-foreground focus:border-ring focus:ring-ring',
		className,
	)}
	{...rest}
>
	{@render children?.()}
</select>
