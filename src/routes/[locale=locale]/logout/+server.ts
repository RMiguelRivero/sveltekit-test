import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME } from '$lib/server/auth/auth.constants';
import type { RequestHandler } from './$types';

// Edge: handler is just a cookie delete + redirect, and the hook chain it runs through
// (translations/locale/auth) is edge-safe — auth reads a statically-imported JSON module
// and verifies sessions with Web Crypto, not node:crypto (see session.ts). Unlike
// login/dashboard-items, this route has no state-changing write, so it isn't pinned to
// Node for write-path consistency.
export const config = { runtime: 'edge' };

export const POST: RequestHandler = ({ cookies, params }) => {
	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
	throw redirect(303, `/${params.locale}`);
};
