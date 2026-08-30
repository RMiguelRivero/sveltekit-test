import { SESSION_DURATION_SECONDS } from './auth.constants';
import { base64UrlToBytes, bytesToBase64Url, getSessionSecret } from './auth.utils';
import type { SessionPayload, SessionUser } from './types';

async function getHmacKey(): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(getSessionSecret()),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign', 'verify'],
	);
}

async function sign(payloadB64: string): Promise<string> {
	const key = await getHmacKey();
	const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
	return bytesToBase64Url(new Uint8Array(signature));
}

export async function createSessionCookieValue(user: SessionUser): Promise<string> {
	const payload: SessionPayload = {
		id: user.id,
		exp: Date.now() + SESSION_DURATION_SECONDS * 1000,
	};
	const payloadB64 = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
	return `${payloadB64}.${await sign(payloadB64)}`;
}

export async function verifySessionCookieValue(value: string): Promise<{ id: string } | null> {
	const [payloadB64, signature] = value.split('.');
	if (!payloadB64 || !signature) {
		return null;
	}

	// Fetched before the try block: a missing/misconfigured SESSION_SECRET is a genuine
	// server bug, not an untrusted-cookie-decoding failure, and should crash loudly (and
	// get logged via hooks.server.ts's handleError) rather than be swallowed as "invalid
	// session" below.
	const key = await getHmacKey();

	try {
		const isValid = await crypto.subtle.verify(
			'HMAC',
			key,
			base64UrlToBytes(signature),
			new TextEncoder().encode(payloadB64),
		);
		if (!isValid) {
			return null;
		}

		const payload = JSON.parse(
			new TextDecoder().decode(base64UrlToBytes(payloadB64)),
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
		// Malformed base64url (invalid characters, or a length that produces invalid
		// padding — never possible from a real signature, but trivial to hand-craft) makes
		// `atob` throw synchronously. Any such decoding failure just means an invalid
		// session, not a server error.
		return null;
	}
}
