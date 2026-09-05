import { SvelteMap } from 'svelte/reactivity';
import type { ToastItem, ToastVariant } from './types';

const DEFAULT_DURATION_MS = 5000;

export const toasts: SvelteMap<string, ToastItem> = new SvelteMap();

export function addToast(message: string, variant: ToastVariant = 'default'): string {
	const id = crypto.randomUUID();
	toasts.set(id, { id, message, variant });
	setTimeout(() => dismissToast(id), DEFAULT_DURATION_MS);
	return id;
}

export function dismissToast(id: string): void {
	toasts.delete(id);
}
