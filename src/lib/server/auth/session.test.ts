import { describe, expect, it } from 'vitest';
import { createSessionCookieValue, verifySessionCookieValue } from './session';
import type { SessionUser } from './types';

const user: SessionUser = {
	id: 'user_123',
	email: 'user@example.com',
	name: 'Test User',
	role: 'viewer',
};

describe('session cookie sign/verify round-trip', () => {
	it('verifies a freshly signed cookie value and returns the user id', async () => {
		const value = await createSessionCookieValue(user);
		const result = await verifySessionCookieValue(value);
		expect(result).toEqual({ id: 'user_123' });
	});

	it('rejects a tampered payload', async () => {
		const value = await createSessionCookieValue(user);
		const [payloadB64, signature] = value.split('.');
		const tamperedPayload = payloadB64.slice(0, -1) + (payloadB64.at(-1) === 'A' ? 'B' : 'A');
		const result = await verifySessionCookieValue(`${tamperedPayload}.${signature}`);
		expect(result).toBeNull();
	});

	it('rejects a malformed value with no signature', async () => {
		const result = await verifySessionCookieValue('not-a-valid-cookie');
		expect(result).toBeNull();
	});

	it('rejects an expired session', async () => {
		const originalNow = Date.now;
		try {
			Date.now = () => 0;
			const value = await createSessionCookieValue(user);

			Date.now = () => Number.MAX_SAFE_INTEGER;
			const result = await verifySessionCookieValue(value);
			expect(result).toBeNull();
		} finally {
			Date.now = originalNow;
		}
	});
});
