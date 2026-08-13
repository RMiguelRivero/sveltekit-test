import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { DEV_FALLBACK_SESSION_SECRET, SESSION_DURATION_SECONDS } from './auth.constants';
import type { SessionPayload, SessionUser } from './types';

// Dynamic (not static) private env: the secret is optional in dev — a documented
// fallback keeps the mock app runnable without a `.env` file — but must be set in
// production, and `$env/static/private` can't express "required in prod, optional
// in dev" since it's resolved at build time.
function getSessionSecret(): string {
	if (env.SESSION_SECRET) {
		return env.SESSION_SECRET;
	}
	if (!dev) {
		throw new Error('SESSION_SECRET environment variable must be set in production');
	}
	console.warn(
		'SESSION_SECRET is not set — using an insecure development fallback. Set SESSION_SECRET in production.',
	);
	return DEV_FALLBACK_SESSION_SECRET;
}

function sign(payloadB64: string): string {
	return createHmac('sha256', getSessionSecret()).update(payloadB64).digest('base64url');
}

function signaturesMatch(expected: string, actual: string): boolean {
	const expectedBuffer = Buffer.from(expected, 'base64url');
	const actualBuffer = Buffer.from(actual, 'base64url');
	return (
		expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer)
	);
}

export function createSessionCookieValue(user: SessionUser): string {
	const payload: SessionPayload = {
		id: user.id,
		exp: Date.now() + SESSION_DURATION_SECONDS * 1000,
	};
	const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
	return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifySessionCookieValue(value: string): { id: string } | null {
	const [payloadB64, signature] = value.split('.');
	if (!payloadB64 || !signature || !signaturesMatch(sign(payloadB64), signature)) {
		return null;
	}

	try {
		const payload = JSON.parse(
			Buffer.from(payloadB64, 'base64url').toString('utf-8'),
		) as SessionPayload;
		if (
			typeof payload.id !== 'string' ||
			typeof payload.exp !== 'number' ||
			Date.now() > payload.exp
		) {
			return null;
		}
		return { id: payload.id };
	} catch {
		return null;
	}
}
