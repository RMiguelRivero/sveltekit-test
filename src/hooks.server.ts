import { LOCALES_SET } from '$lib/i18n/constants';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;

	if (pathname === '/') {
		return new Response(undefined, {
			status: 307,
			headers: { location: '/en' },
		});
	}

	const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean);
	const locale = segments[0];

	if (segments.length > 0 && !LOCALES_SET.has(locale)) {
		return new Response('Not found', { status: 404 });
	}

	return resolve(event);
};
