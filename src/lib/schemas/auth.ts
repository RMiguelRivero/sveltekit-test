import { z } from 'zod';
import { userSchema } from './user';

export const loginPayloadSchema = z
	.object({
		email: z.email(),
		password: z.string().min(1),
	})
	.meta({ id: 'loginPayloadSchema' });

export const loginResultSchema = z
	.object({
		ok: z.boolean(),
		user: userSchema.optional(),
		message: z.string().optional(),
	})
	.meta({ id: 'loginResultSchema' });

export type LoginPayload = z.infer<typeof loginPayloadSchema>;
export type LoginResult = z.infer<typeof loginResultSchema>;
