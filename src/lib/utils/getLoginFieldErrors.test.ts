import assert from 'node:assert';
import { describe, expect, it } from 'vitest';
import { getLoginFieldErrors } from './getLoginFieldErrors';
import { loginPayloadSchema } from '$lib/schemas';

const messages = {
	email: 'Please enter a valid email address.',
	password: 'Password is required.',
};

describe('getLoginFieldErrors', () => {
	it('returns the translated email message for an invalid email', () => {
		const result = loginPayloadSchema.safeParse({ email: 'not-an-email', password: 'secret' });
		assert(!result.success);
		expect(getLoginFieldErrors(result, messages)).toEqual({ email: messages.email });
	});

	it('returns the translated password message for an empty password', () => {
		const result = loginPayloadSchema.safeParse({ email: 'user@example.com', password: '' });
		assert(!result.success);
		expect(getLoginFieldErrors(result, messages)).toEqual({ password: messages.password });
	});

	it('returns both translated messages when both fields are invalid', () => {
		const result = loginPayloadSchema.safeParse({ email: 'not-an-email', password: '' });
		assert(!result.success);
		expect(getLoginFieldErrors(result, messages)).toEqual({
			email: messages.email,
			password: messages.password,
		});
	});
});
