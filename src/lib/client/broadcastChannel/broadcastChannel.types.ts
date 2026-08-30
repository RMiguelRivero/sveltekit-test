import type { SESSION_LOGIN_MESSAGE, SESSION_LOGOUT_MESSAGE } from './broadcastChannel.constants';

export type GenericBroadcastPost<T extends string = string, P extends object = object> = {
	type: T;
	payload?: P;
};

export type SessionLogoutPost = GenericBroadcastPost<typeof SESSION_LOGOUT_MESSAGE>;
export type SessionLoginPost = GenericBroadcastPost<typeof SESSION_LOGIN_MESSAGE>;

export type BroadcastPost = XOR<SessionLogoutPost, SessionLoginPost>;

type AssertMatchesEnvelope<U extends GenericBroadcastPost> = U;
export type _BroadcastPostMatchesEnvelope = AssertMatchesEnvelope<BroadcastPost>;
