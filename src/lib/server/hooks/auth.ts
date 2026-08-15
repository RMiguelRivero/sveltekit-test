import type { Handle } from '@sveltejs/kit';
import { getUsers } from '$lib/server/api';
import { SESSION_COOKIE_NAME } from '$lib/server/auth/auth.constants';
import { verifySessionCookieValue } from '$lib/server/auth/session';

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
	event.locals.user = await resolveSessionUser(event.cookies.get(SESSION_COOKIE_NAME));
	if (!event.locals.user && event.cookies.get(SESSION_COOKIE_NAME)) {
		event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
	}
	return resolve(event);
};
