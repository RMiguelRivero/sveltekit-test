import { afterEach, describe, expect, it, vi } from 'vitest';
import { Channel } from './broadcastChannel/broadcastChannel';
import {
	broadcastSessionLogout,
	isSessionLogoutMessage,
	listenForSessionLogout,
} from './sessionBroadcast';
import { SESSION_LOGOUT_MESSAGE } from './broadcastChannel/broadcastChannel.constants';

afterEach(() => {
	vi.restoreAllMocks();
});

describe('isSessionLogoutMessage', () => {
	it('returns true for a session logout message', () => {
		expect(isSessionLogoutMessage({ type: SESSION_LOGOUT_MESSAGE })).toBe(true);
	});

	it('returns false for a different message type', () => {
		expect(isSessionLogoutMessage({ type: 'something-else' })).toBe(false);
	});

	it('returns false for malformed data', () => {
		expect(isSessionLogoutMessage(null)).toBe(false);
		expect(isSessionLogoutMessage('a string')).toBe(false);
	});
});

describe('broadcastSessionLogout', () => {
	it('posts a session logout message on the shared channel', () => {
		const post = vi.spyOn(Channel, 'post');

		broadcastSessionLogout();

		expect(post).toHaveBeenCalledWith({ type: SESSION_LOGOUT_MESSAGE });
	});
});

describe('listenForSessionLogout', () => {
	it('calls onLogout when a session logout message arrives', () => {
		const onLogout = vi.fn();
		vi.spyOn(Channel, 'onMessage').mockImplementation((handleMessage) => {
			handleMessage({ data: { type: SESSION_LOGOUT_MESSAGE } } as MessageEvent);
			return vi.fn();
		});

		listenForSessionLogout(onLogout);

		expect(onLogout).toHaveBeenCalledOnce();
	});

	it('does not call onLogout for unrelated messages', () => {
		const onLogout = vi.fn();
		vi.spyOn(Channel, 'onMessage').mockImplementation((handleMessage) => {
			handleMessage({ data: { type: 'something-else' } } as MessageEvent);
			return vi.fn();
		});

		listenForSessionLogout(onLogout);

		expect(onLogout).not.toHaveBeenCalled();
	});

	it('returns the cleanup function from Channel.onMessage', () => {
		const stopListening = vi.fn();
		vi.spyOn(Channel, 'onMessage').mockReturnValue(stopListening);

		expect(listenForSessionLogout(vi.fn())).toBe(stopListening);
	});
});
