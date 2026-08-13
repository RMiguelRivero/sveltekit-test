import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME } from '$lib/server/auth/auth.constants';
import type { RequestHandler } from './$types';

export const config = { runtime: 'nodejs20.x' };

export const POST: RequestHandler = ({ cookies, params }) => {
	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
	throw redirect(303, `/${params.locale}`);
};
