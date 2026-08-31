import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	dev: false,
	sessionSecret: undefined as string | undefined,
}));

vi.mock('$app/environment', () => ({
	get dev() {
		return mocks.dev;
	},
}));

vi.mock('$env/dynamic/private', () => ({
	env: {
		get SESSION_SECRET() {
			return mocks.sessionSecret;
		},
	},
}));

import { DEV_FALLBACK_SESSION_SECRET, SESSION_DURATION_SECONDS } from './auth.constants';
import {
	base64UrlToBytes,
	bytesToBase64Url,
	getSessionCookieOptions,
	getSessionSecret,
} from './auth.utils';

beforeEach(() => {
	mocks.dev = false;
	mocks.sessionSecret = 'test-secret';
});

describe('bytesToBase64Url', () => {
	it('encodes bytes into a base64url string with padding stripped', () => {
		expect(bytesToBase64Url(new TextEncoder().encode('Hello'))).toBe('SGVsbG8');
	});

	it('replaces the standard base64 "+" and "/" characters with "-" and "_"', () => {
		// [251, 255, 191] is standard-base64 "+/+/" — chosen specifically to exercise both
		// substitutions in one input.
		expect(bytesToBase64Url(new Uint8Array([251, 255, 191]))).toBe('-_-_');
	});

	it('encodes an empty array to an empty string', () => {
		expect(bytesToBase64Url(new Uint8Array())).toBe('');
	});
});

describe('getSessionSecret', () => {
	it('returns the configured secret when SESSION_SECRET is set', () => {
		mocks.sessionSecret = 'configured-secret';
		expect(getSessionSecret()).toBe('configured-secret');
	});

	it('returns the configured secret even in dev mode', () => {
		mocks.dev = true;
		mocks.sessionSecret = 'configured-secret';
		expect(getSessionSecret()).toBe('configured-secret');
	});

	it('falls back to the dev secret when unset in dev mode', () => {
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		mocks.dev = true;
		mocks.sessionSecret = undefined;
		expect(getSessionSecret()).toBe(DEV_FALLBACK_SESSION_SECRET);
	});

	it('throws when unset outside of dev mode', () => {
		mocks.dev = false;
		mocks.sessionSecret = undefined;
		expect(() => getSessionSecret()).toThrow(
			'SESSION_SECRET environment variable must be set in production',
		);
	});
});

describe('getSessionCookieOptions', () => {
	it('marks the cookie secure outside of dev mode', () => {
		mocks.dev = false;
		expect(getSessionCookieOptions()).toEqual({
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			path: '/',
			maxAge: SESSION_DURATION_SECONDS,
		});
	});

	it('marks the cookie insecure in dev mode', () => {
		mocks.dev = true;
		expect(getSessionCookieOptions()).toEqual({
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
			path: '/',
			maxAge: SESSION_DURATION_SECONDS,
		});
	});
});

describe('base64UrlToBytes', () => {
	it('decodes a base64url string back into the original bytes', () => {
		expect(base64UrlToBytes('SGVsbG8')).toEqual(new TextEncoder().encode('Hello'));
	});

	it('decodes "-" and "_" back to their standard base64 "+" and "/" meaning', () => {
		expect(base64UrlToBytes('-_-_')).toEqual(new Uint8Array([251, 255, 191]));
	});

	it('round-trips arbitrary bytes through bytesToBase64Url', () => {
		const original = new Uint8Array([0, 1, 2, 127, 128, 255, 254, 253]);
		expect(base64UrlToBytes(bytesToBase64Url(original))).toEqual(original);
	});

	it('throws for a value whose length produces invalid base64 padding', () => {
		expect(() => base64UrlToBytes('value')).toThrow();
	});
});
