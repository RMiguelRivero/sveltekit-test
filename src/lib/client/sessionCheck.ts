import { sessionCheckResponseSchema } from '$lib/schemas';
import { SESSION_CHECK_ENDPOINT } from './sessionCheck.constants';

export function isTabVisible(visibilityState: DocumentVisibilityState): boolean {
	return visibilityState === 'visible';
}

export async function isSessionActive(fetchFn: typeof fetch = fetch): Promise<boolean> {
	const response = await fetchFn(SESSION_CHECK_ENDPOINT, { cache: 'no-store' }).catch(() => null);
	if (!response || !response.ok) {
		return true;
	}
	const body: unknown = await response.json().catch(() => undefined);
	const result = sessionCheckResponseSchema.safeParse(body);
	return !result.success || result.data.authenticated;
}

export async function isSessionExpiredOnFocus(
	visibilityState: DocumentVisibilityState,
	isSessionActive: () => Promise<boolean>,
): Promise<boolean> {
	if (!isTabVisible(visibilityState)) {
		return false;
	}
	return !(await isSessionActive());
}

export function initSessionFocusCheck(options: {
	isSessionActive: () => Promise<boolean>;
	onSessionExpired: () => void;
}): () => void {
	async function handleVisibilityChange(): Promise<void> {
		if (await isSessionExpiredOnFocus(document.visibilityState, options.isSessionActive)) {
			options.onSessionExpired();
		}
	}

	document.addEventListener('visibilitychange', handleVisibilityChange);
	return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}
