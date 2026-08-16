<script lang="ts">
	import type { Snippet } from 'svelte';
	import X from '@lucide/svelte/icons/x';
	import { cn } from 'classname';
	import Button from './Button.svelte';
	import Heading from './Heading.svelte';

	const FOCUSABLE_SELECTOR =
		'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
	// Keep in sync with the `duration-300` transition class on the dialog below — this is
	// what defers the actual native close until the reverse slide-down finishes.
	const CLOSE_TRANSITION_MS = 300;

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
	let closeTimeoutId: ReturnType<typeof setTimeout> | undefined;

	function cancelPendingClose(): void {
		clearTimeout(closeTimeoutId);
		closeTimeoutId = undefined;
	}

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

	// The native 'cancel' event (Escape) closes the dialog immediately by default — prevented
	// here so the reverse slide-down transition below gets to play first, same as a
	// button/backdrop-triggered close.
	function handleCancel(event: Event): void {
		event.preventDefault();
		close();
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
			cancelPendingClose();
			openDialog();
		} else if (dialogEl.open) {
			// Deferred so the reverse slide-down transition (see the `open`-driven translate
			// class below) gets to play before the dialog actually leaves the top layer,
			// instead of vanishing the instant `open` flips false.
			closeTimeoutId = setTimeout(() => dialogEl?.close(), CLOSE_TRANSITION_MS);
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
	class={cn(
		'inset-x-0 top-auto bottom-0 m-0 max-h-[85vh] w-full max-w-none border-0 bg-transparent p-0 transition-transform duration-300 ease-out backdrop:bg-foreground/50 backdrop:backdrop-blur-sm md:inset-0 md:m-auto md:w-[calc(100%-2rem)] md:max-w-md',
		open ? 'translate-y-0 starting:translate-y-full' : 'translate-y-full',
	)}
	aria-labelledby={titleId}
	aria-describedby={description ? descriptionId : undefined}
	tabindex="-1"
	onclick={handleBackdropClick}
	onclose={handleClose}
	oncancel={handleCancel}
	onkeydown={trapFocus}
>
	<div
		class={cn(
			'flex max-h-[85vh] flex-col overflow-hidden rounded-t-lg border border-border bg-card text-card-foreground shadow-lg md:rounded-lg',
			className,
		)}
	>
		<div class="shrink-0 p-6 pb-4">
			<div class="flex items-start justify-between gap-4">
				<Heading level={2} id={titleId} class="text-lg">{title}</Heading>
				<Button variant="ghost" size="icon" class="shrink-0" aria-label="Close" onclick={close}>
					<X class="h-4 w-4" aria-hidden="true" />
				</Button>
			</div>
			{#if description}
				<p id={descriptionId} class="mt-2 text-sm text-muted-foreground">{description}</p>
			{/if}
		</div>

		<div class="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
			{@render children?.()}
		</div>
		{#if footer}
			<div class="flex shrink-0 justify-end gap-2 p-6">
				{@render footer()}
			</div>
		{/if}
	</div>
</dialog>
