import { afterEach, describe, expect, it, vi } from 'vitest';
import { Channel, isBroadcastPostOfType } from './broadcastChannel';
import { BROADCAST_CHANNEL_NAME, SESSION_LOGOUT_MESSAGE } from './broadcastChannel.constants';

afterEach(() => {
	vi.restoreAllMocks();
});

describe('isBroadcastPostOfType', () => {
	it('returns true when the data matches the given type', () => {
		expect(isBroadcastPostOfType({ type: SESSION_LOGOUT_MESSAGE }, SESSION_LOGOUT_MESSAGE)).toBe(
			true,
		);
	});

	it('returns false when the data has a different type', () => {
		expect(isBroadcastPostOfType({ type: 'other-message' }, SESSION_LOGOUT_MESSAGE)).toBe(false);
	});

	it('returns false for malformed data', () => {
		expect(isBroadcastPostOfType(null, SESSION_LOGOUT_MESSAGE)).toBe(false);
		expect(isBroadcastPostOfType('a string', SESSION_LOGOUT_MESSAGE)).toBe(false);
		expect(isBroadcastPostOfType(undefined, SESSION_LOGOUT_MESSAGE)).toBe(false);
	});
});

describe('Channel.post', () => {
	it('posts the message to another instance on the same channel', async () => {
		const listener = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
		const received = new Promise<MessageEvent>((resolve) => {
			listener.onmessage = resolve;
		});

		Channel.post({ type: SESSION_LOGOUT_MESSAGE });

		expect((await received).data).toEqual({ type: SESSION_LOGOUT_MESSAGE });
		listener.close();
	});

	it('can be asserted via a prototype spy instead of an injected mock', () => {
		const postMessage = vi.spyOn(BroadcastChannel.prototype, 'postMessage');

		Channel.post({ type: SESSION_LOGOUT_MESSAGE });

		expect(postMessage).toHaveBeenCalledWith({ type: SESSION_LOGOUT_MESSAGE });
	});
});

describe('Channel.onMessage', () => {
	it('invokes the handler when a message arrives on the channel', async () => {
		const handleMessage = vi.fn();
		const stopListening = Channel.onMessage(handleMessage);
		const sender = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

		sender.postMessage({ type: SESSION_LOGOUT_MESSAGE });
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(handleMessage).toHaveBeenCalledOnce();
		stopListening();
		sender.close();
	});
});
