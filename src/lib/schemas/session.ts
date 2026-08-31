import { z } from 'zod';

export const sessionCheckResponseSchema = z
	.object({
		authenticated: z.boolean(),
	})
	.meta({ id: 'sessionCheckResponseSchema' });

export type SessionCheckResponse = z.infer<typeof sessionCheckResponseSchema>;
