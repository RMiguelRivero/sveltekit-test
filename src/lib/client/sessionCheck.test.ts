import { describe, expect, it, vi } from 'vitest';
import { isSessionActive, isSessionExpiredOnFocus, isTabVisible } from './sessionCheck';

describe('isTabVisible', () => {
	it('returns true when the document is visible', () => {
		expect(isTabVisible('visible')).toBe(true);
	});

	it('returns false when the document is hidden', () => {
		expect(isTabVisible('hidden')).toBe(false);
	});
});

describe('isSessionActive', () => {
	it('returns true for a successful authenticated response', async () => {
		const fetchFn = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ authenticated: true }),
		}) as unknown as typeof fetch;
		expect(await isSessionActive(fetchFn)).toBe(true);
	});

	it('returns false for a successful unauthenticated response', async () => {
		const fetchFn = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ authenticated: false }),
		}) as unknown as typeof fetch;
		expect(await isSessionActive(fetchFn)).toBe(false);
	});

	it('fails open when the request rejects', async () => {
		const fetchFn = vi
			.fn()
			.mockRejectedValue(new Error('network error')) as unknown as typeof fetch;
		expect(await isSessionActive(fetchFn)).toBe(true);
	});

	it('fails open when the response is not ok', async () => {
		const fetchFn = vi.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch;
		expect(await isSessionActive(fetchFn)).toBe(true);
	});

	it('fails open when the response body is not valid JSON', async () => {
		const fetchFn = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.reject(new Error('invalid json')),
		}) as unknown as typeof fetch;
		expect(await isSessionActive(fetchFn)).toBe(true);
	});

	it('fails open when the response body does not match the expected shape', async () => {
		const fetchFn = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ foo: 'bar' }),
		}) as unknown as typeof fetch;
		expect(await isSessionActive(fetchFn)).toBe(true);
	});
});

describe('isSessionExpiredOnFocus', () => {
	it('does not check the session when the tab is hidden', async () => {
		const isSessionActive = vi.fn().mockResolvedValue(true);
		const result = await isSessionExpiredOnFocus('hidden', isSessionActive);
		expect(result).toBe(false);
		expect(isSessionActive).not.toHaveBeenCalled();
	});

	it('is not expired when the tab is visible and the session is active', async () => {
		const isSessionActive = vi.fn().mockResolvedValue(true);
		const result = await isSessionExpiredOnFocus('visible', isSessionActive);
		expect(result).toBe(false);
	});

	it('is expired when the tab is visible and the session is not active', async () => {
		const isSessionActive = vi.fn().mockResolvedValue(false);
		const result = await isSessionExpiredOnFocus('visible', isSessionActive);
		expect(result).toBe(true);
	});
});
