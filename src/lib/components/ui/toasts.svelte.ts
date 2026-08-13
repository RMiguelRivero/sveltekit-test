import type { ToastItem, ToastVariant } from './types';

const DEFAULT_DURATION_MS = 5000;

export const toasts: ToastItem[] = $state([]);

export function addToast(message: string, variant: ToastVariant = 'default'): string {
	const id = crypto.randomUUID();
	toasts.push({ id, message, variant });
	setTimeout(() => dismissToast(id), DEFAULT_DURATION_MS);
	return id;
}

export function dismissToast(id: string): void {
	const index = toasts.findIndex((toast) => toast.id === id);
	if (index !== -1) {
		toasts.splice(index, 1);
	}
}
