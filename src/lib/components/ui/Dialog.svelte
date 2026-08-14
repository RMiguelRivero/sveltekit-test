<script lang="ts">
	import type { Snippet } from 'svelte';
	import X from '@lucide/svelte/icons/x';
	import { cn } from 'classname';
	import Button from './Button.svelte';
	import Heading from './Heading.svelte';

	const FOCUSABLE_SELECTOR =
		'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

	export interface Props {
		open: boolean;
		title: string;
		description?: string;
		class?: string;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		open = $bindable(false),
		title,
		description,
		class: className,
		children,
		footer,
	}: Props = $props();

	const uid = $props.id();
	const titleId = `${uid}-title`;
	const descriptionId = `${uid}-description`;

	let dialogEl: HTMLDialogElement | undefined = $state();
	let previouslyFocused: HTMLElement | null = null;

	function getFocusableElements(): HTMLElement[] {
		return dialogEl ? Array.from(dialogEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];
	}

	function focusInitialElement(): void {
		const [first] = getFocusableElements();
		(first ?? dialogEl)?.focus();
	}

	function openDialog(): void {
		if (!dialogEl || dialogEl.open) return;
		previouslyFocused =
			document.activeElement instanceof HTMLElement ? document.activeElement : null;
		dialogEl.showModal();
		focusInitialElement();
	}

	function close(): void {
		open = false;
	}

	function handleClose(): void {
		open = false;
		previouslyFocused?.focus();
		previouslyFocused = null;
	}

	function handleBackdropClick(event: MouseEvent): void {
		if (event.target === dialogEl) close();
	}

	function trapFocus(event: KeyboardEvent): void {
		if (event.key !== 'Tab') return;
		const focusable = getFocusableElements();
		if (focusable.length === 0) {
			event.preventDefault();
			return;
		}
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	$effect(() => {
		if (!dialogEl) return;
		if (open) {
			openDialog();
		} else if (dialogEl.open) {
			dialogEl.close();
		}
	});

	$effect(() => {
		if (!open) return;
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = originalOverflow;
		};
	});
</script>

<dialog
	bind:this={dialogEl}
	class="m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-md border-0 bg-transparent p-0 backdrop:bg-foreground/50 backdrop:backdrop-blur-sm"
	aria-labelledby={titleId}
	aria-describedby={description ? descriptionId : undefined}
	tabindex="-1"
	onclick={handleBackdropClick}
	onclose={handleClose}
	onkeydown={trapFocus}
>
	<div
		class={cn(
			'max-h-[85vh] overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg',
			className,
		)}
	>
		<div class="flex items-start justify-between gap-4">
			<Heading level={2} id={titleId} class="text-lg">{title}</Heading>
			<Button variant="ghost" size="icon" class="shrink-0" aria-label="Close" onclick={close}>
				<X class="h-4 w-4" aria-hidden="true" />
			</Button>
		</div>
		{#if description}
			<p id={descriptionId} class="mt-2 text-sm text-muted-foreground">{description}</p>
		{/if}
		<div class="mt-4">
			{@render children?.()}
		</div>
		{#if footer}
			<div class="mt-6 flex justify-end gap-2">
				{@render footer()}
			</div>
		{/if}
	</div>
</dialog>
