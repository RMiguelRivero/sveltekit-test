import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { DEV_FALLBACK_SESSION_SECRET, SESSION_DURATION_SECONDS } from './auth.constants';
import type { Cookies } from '@sveltejs/kit';

// Web Crypto (`crypto.subtle`), not `node:crypto`: session.ts (the consumer of
// getSessionSecret) is reached from every request via hooks.server.ts, including routes
// configured for Vercel's edge runtime (e.g. the opengraph-image endpoint), which has no
// Node.js built-ins at all. Web Crypto and `btoa`/`atob` are the subset of crypto APIs
// available in both runtimes.
export function getSessionSecret(): string {
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

export function bytesToBase64Url(bytes: Uint8Array): string {
	let binary = '';
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
	const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

export function getSessionCookieOptions(): NonNullable<Parameters<Cookies['set']>[2]> {
	return {
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax',
		path: '/',
		maxAge: SESSION_DURATION_SECONDS,
	};
}
