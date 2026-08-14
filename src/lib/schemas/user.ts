import { z } from 'zod';

export const userRoleSchema = z.enum(['admin', 'editor', 'viewer']).meta({ id: 'userRoleSchema' });

export const userSchema = z
	.object({
		id: z.string(),
		email: z.email(),
		password: z.string(),
		name: z.string(),
		role: userRoleSchema,
	})
	.meta({ id: 'userSchema' });

export const userListSchema = z.array(userSchema).meta({ id: 'userListSchema' });

export type User = z.infer<typeof userSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
