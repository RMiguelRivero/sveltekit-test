import type { Handle } from '@sveltejs/kit';
import { getUsers } from '$lib/server/api';
import { SESSION_CHECK_PATHNAME, SESSION_COOKIE_NAME } from '$lib/server/auth/auth.constants';
import { createSessionCookieValue, verifySessionCookieValue } from '$lib/server/auth/session';
import { getSessionCookieOptions } from '$lib/server/auth/auth.utils';

async function resolveSessionUser(cookieValue: string | undefined): Promise<App.Locals['user']> {
	if (!cookieValue) {
		return null;
	}
	const session = await verifySessionCookieValue(cookieValue);
	if (!session) {
		return null;
	}
	const user = (await getUsers()).find((candidate) => candidate.id === session.id);
	if (!user) {
		return null;
	}
	const { password: _password, ...sessionUser } = user;
	return sessionUser;
}

export const handleAuth: Handle = async ({ event, resolve }) => {
	const cookieValue = event.cookies.get(SESSION_COOKIE_NAME);
	event.locals.user = await resolveSessionUser(cookieValue);

	if (!event.locals.user) {
		if (cookieValue) {
			event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
		}
		return resolve(event);
	}

	// Sliding expiration: every request with a valid session re-signs the cookie with a
	// fresh exp, so activity keeps the session alive while true idle time still expires it.
	// The focus-triggered check hits SESSION_CHECK_PATHNAME to verify liveness without
	// counting as activity, so it's excluded from the refresh.
	if (event.url.pathname !== SESSION_CHECK_PATHNAME) {
		const refreshedCookieValue = await createSessionCookieValue(event.locals.user);
		event.cookies.set(SESSION_COOKIE_NAME, refreshedCookieValue, getSessionCookieOptions());
	}

	return resolve(event);
};
