import { Channel, isBroadcastPostOfType } from './broadcastChannel/broadcastChannel';
import { SESSION_LOGOUT_MESSAGE } from './broadcastChannel/broadcastChannel.constants';
import type { SessionLogoutPost } from './broadcastChannel/broadcastChannel.types';

export function isSessionLogoutMessage(data: unknown): data is SessionLogoutPost {
	return isBroadcastPostOfType(data, SESSION_LOGOUT_MESSAGE);
}

export function broadcastSessionLogout(): void {
	Channel.post({ type: SESSION_LOGOUT_MESSAGE });
}

export function listenForSessionLogout(onLogout: () => void): () => void {
	return Channel.onMessage((event) => {
		if (isSessionLogoutMessage(event.data)) {
			onLogout();
		}
	});
}
