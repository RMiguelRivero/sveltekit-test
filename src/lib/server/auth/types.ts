import type { User } from '$lib/schemas';

export type SessionUser = Omit<User, 'password'>;

export type SessionPayload = {
	id: string;
	exp: number;
};
