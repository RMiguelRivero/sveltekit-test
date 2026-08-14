import type { HandleClientError, NavigationEvent } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { send } from '$lib/client/rum';
import type { ClientErrorEvent } from '$lib/schemas';

const FALLBACK_ERROR_MESSAGE = 'An unexpected error occurred. Please try again.';

function toClientErrorEvent(
	error: unknown,
	event: NavigationEvent,
	status: number,
	message: string,
): ClientErrorEvent {
	return {
		type: 'client-error',
		message,
		status,
		path: event.url.pathname,
		stack: dev && error instanceof Error ? error.stack : undefined,
	};
}

export const handleError: HandleClientError = ({ error, event, status, message }) => {
	send(toClientErrorEvent(error, event, status, message));

	return { message: FALLBACK_ERROR_MESSAGE };
};
