import type { HandleServerError, RequestEvent } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { handleTranslations } from '$lib/server/hooks/translations';
import { handleLocale } from '$lib/server/hooks/locale';
import { handleAuth } from '$lib/server/hooks/auth';
import type { ServerErrorEvent } from '$lib/schemas';

function toServerErrorEvent(
	error: unknown,
	event: RequestEvent,
	status: number,
	message: string,
): ServerErrorEvent {
	return {
		type: 'server-error',
		message,
		status,
		path: event.url.pathname,
		stack: error instanceof Error ? error.stack : undefined,
	};
}

export const handle = sequence(handleTranslations, handleLocale, handleAuth);

export const handleError: HandleServerError = ({ error, event, status, message }) => {
	console.error(
		'[server-error]',
		JSON.stringify(toServerErrorEvent(error, event, status, message)),
	);
};
