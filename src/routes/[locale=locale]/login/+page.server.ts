import { z } from 'zod';
import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getUsers } from '$lib/server/api';
import { createSessionCookieValue } from '$lib/server/auth/session';
import { SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from '$lib/server/auth/auth.constants';
import { loginPayloadSchema } from '$lib/schemas';
import type { Actions, PageServerLoad } from './$types';

export const config = { runtime: 'nodejs20.x' };

// Only accept a same-locale, in-app path as a post-login redirect target — anything
// else (an absolute URL, a different locale, a bare "//evil.com") falls back to the
// dashboard, which prevents `redirectTo` from being used as an open-redirect vector.
function resolveRedirectTarget(locale: string, redirectTo: string | null): string {
	const fallback = `/${locale}/dashboard`;
	if (!redirectTo || !redirectTo.startsWith(`/${locale}/`)) {
		return fallback;
	}
	return redirectTo;
}

export const load: PageServerLoad = ({ locals, params, url }) => {
	if (locals.user) {
		throw redirect(303, resolveRedirectTarget(params.locale, url.searchParams.get('redirectTo')));
	}
};

export const actions: Actions = {
	default: async ({ request, cookies, locals, params, url }) => {
		const formData = Object.fromEntries(await request.formData());
		const result = loginPayloadSchema.safeParse(formData);

		if (!result.success) {
			return fail(400, { errors: z.flattenError(result.error).fieldErrors });
		}

		const { email, password } = result.data;
		const user = (await getUsers()).find((candidate) => candidate.email === email);

		// Mock auth only: the demo data itself stores plaintext passwords. A real system
		// would hash+compare (e.g. bcrypt/argon2) and never store plaintext at all.
		if (!user || user.password !== password) {
			return fail(401, { message: locals.translations.login.error });
		}

		const { password: _password, ...sessionUser } = user;
		const sessionCookieValue = await createSessionCookieValue(sessionUser);
		cookies.set(SESSION_COOKIE_NAME, sessionCookieValue, {
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax',
			path: '/',
			maxAge: SESSION_DURATION_SECONDS,
		});

		throw redirect(303, resolveRedirectTarget(params.locale, url.searchParams.get('redirectTo')));
	},
};
