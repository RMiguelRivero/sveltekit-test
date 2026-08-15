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
		'block w-full cursor-pointer rounded-md border-border bg-background text-sm text-foreground transition-colors focus:border-ring focus:ring-ring disabled:cursor-not-allowed',
		className,
	)}
	{...rest}
>
	{@render children?.()}
</select>
