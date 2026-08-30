import { BROADCAST_CHANNEL_NAME } from './broadcastChannel.constants';
import type { BroadcastPost } from './broadcastChannel.types';

let channel: BroadcastChannel | undefined;

function getChannel(): BroadcastChannel {
	channel ??= new BroadcastChannel(BROADCAST_CHANNEL_NAME);
	return channel;
}

function withBroadcastChannel<Args extends unknown[], R>(
	fn: (channel: BroadcastChannel, ...args: Args) => R,
): (...args: Args) => R {
	return (...args: Args): R => fn(getChannel(), ...args);
}

const post = withBroadcastChannel((channel, data: BroadcastPost): void => {
	channel.postMessage(data);
});

const onMessage = withBroadcastChannel(
	(channel, handleMessage: (event: MessageEvent<BroadcastPost>) => void): (() => void) => {
		channel.addEventListener('message', handleMessage);
		return () => channel.removeEventListener('message', handleMessage);
	},
);

export const Channel = {
	post,
	onMessage,
};

export function isBroadcastPostOfType<T extends BroadcastPost['type']>(
	data: unknown,
	type: T,
): data is Extract<BroadcastPost, { type: T }> {
	return typeof data === 'object' && data !== null && 'type' in data && data.type === type;
}
