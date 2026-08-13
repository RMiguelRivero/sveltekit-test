import { z } from 'zod';
import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getValidatedUsers } from '$lib/server/api';
import { createSessionCookieValue } from '$lib/server/auth/session';
import { SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from '$lib/server/auth/auth.constants';
import { loginPayloadSchema } from '$lib/schemas';
import { translations } from '$lib/i18n/constants';
import type { Actions, PageServerLoad } from './$types';

// `node:crypto` HMAC signing in the session module needs the Node runtime, not edge.
export const config = { runtime: 'nodejs20.x' };

export const load: PageServerLoad = ({ locals, params }) => {
	if (locals.user) {
		throw redirect(303, `/${params.locale}/dashboard`);
	}
};

export const actions: Actions = {
	default: async ({ request, cookies, params }) => {
		const formData = Object.fromEntries(await request.formData());
		const result = loginPayloadSchema.safeParse(formData);

		if (!result.success) {
			return fail(400, { errors: z.flattenError(result.error).fieldErrors });
		}

		const { email, password } = result.data;
		const user = getValidatedUsers().find((candidate) => candidate.email === email);

		// Mock auth only: the demo data itself stores plaintext passwords. A real system
		// would hash+compare (e.g. bcrypt/argon2) and never store plaintext at all.
		if (!user || user.password !== password) {
			return fail(401, { message: translations[params.locale].login.error });
		}

		const { password: _password, ...sessionUser } = user;
		cookies.set(SESSION_COOKIE_NAME, createSessionCookieValue(sessionUser), {
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax',
			path: '/',
			maxAge: SESSION_DURATION_SECONDS,
		});

		throw redirect(303, `/${params.locale}/dashboard`);
	},
};
