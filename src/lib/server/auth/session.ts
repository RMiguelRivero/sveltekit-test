import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { DEV_FALLBACK_SESSION_SECRET, SESSION_DURATION_SECONDS } from './auth.constants';
import type { SessionPayload, SessionUser } from './types';

// Web Crypto (`crypto.subtle`), not `node:crypto`: this module is reached from every
// request via hooks.server.ts, including routes configured for Vercel's edge runtime
// (e.g. the opengraph-image endpoint), which has no Node.js built-ins at all. Web
// Crypto and `btoa`/`atob` are the subset of crypto APIs available in both runtimes.
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

function bytesToBase64Url(bytes: Uint8Array): string {
	let binary = '';
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
	const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

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

	const key = await getHmacKey();
	const isValid = await crypto.subtle.verify(
		'HMAC',
		key,
		base64UrlToBytes(signature),
		new TextEncoder().encode(payloadB64),
	);
	if (!isValid) {
		return null;
	}

	try {
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
		return null;
	}
}
