import { z } from 'zod';
import type { LoginPayload } from '$lib/schemas';
import type { Translation } from '$lib/i18n/constants';

export type LoginFieldErrors = { email?: string; password?: string };

export function getLoginFieldErrors(
	result: z.ZodSafeParseError<LoginPayload>,
	messages: Translation['login']['errors'],
): LoginFieldErrors {
	const fieldErrors = z.flattenError(result.error).fieldErrors;
	return {
		email: fieldErrors.email ? messages.email : undefined,
		password: fieldErrors.password ? messages.password : undefined,
	};
}
