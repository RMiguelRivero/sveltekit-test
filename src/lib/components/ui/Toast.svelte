<script lang="ts" module>
	import type { ToastVariant } from './types';

	const variantClasses: Record<ToastVariant, string> = {
		default: 'border-border bg-card text-card-foreground',
		success: 'border-transparent bg-success text-success-foreground',
		error: 'border-transparent bg-destructive text-destructive-foreground',
	};
</script>

<script lang="ts">
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import X from '@lucide/svelte/icons/x';
	import { cn } from 'classname';
	import { dismissToast, toasts } from './toasts.svelte';
</script>

<div
	class="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
>
	{#each toasts as toast (toast.id)}
		<div
			role={toast.variant === 'error' ? 'alert' : 'status'}
			aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
			class={cn(
				'pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg',
				variantClasses[toast.variant],
			)}
		>
			{#if toast.variant === 'success'}
				<CheckCircle2 class="h-4 w-4 shrink-0" aria-hidden="true" />
			{:else if toast.variant === 'error'}
				<AlertCircle class="h-4 w-4 shrink-0" aria-hidden="true" />
			{/if}
			<p class="flex-1">{toast.message}</p>
			<button
				type="button"
				onclick={() => dismissToast(toast.id)}
				aria-label="Dismiss notification"
				class="shrink-0 rounded-sm text-current/70 hover:text-current focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				<X class="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	{/each}
</div>
