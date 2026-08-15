import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME } from '$lib/server/auth/auth.constants';
import type { RequestHandler } from './$types';

// Not technically required by anything this handler does (it's just a cookie delete +
// redirect), but pinned to Node explicitly for consistency with the other session-mutating
// auth routes (login, dashboard items) rather than left to fall through to the adapter default.
export const config = { runtime: 'nodejs20.x' };

export const POST: RequestHandler = ({ cookies, params }) => {
	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
	throw redirect(303, `/${params.locale}`);
};
