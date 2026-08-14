<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from 'classname';
	import { getInitials } from '$lib/utils/getInitials';

	export interface Props extends HTMLAttributes<HTMLSpanElement> {
		name: string;
		class?: string;
	}

	let { name, class: className, ...rest }: Props = $props();

	const initials = $derived(getInitials(name));
</script>

<span
	class={cn(
		'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary',
		className,
	)}
	aria-hidden="true"
	{...rest}
>
	{initials}
</span>
