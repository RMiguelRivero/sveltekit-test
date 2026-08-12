import { z } from 'zod';

export const localeSchema = z.enum(['en', 'de']);

export const authorSchema = z.object({
	id: z.string(),
	name: z.string(),
	avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/)
});

export const postTranslationSchema = z.object({
	title: z.string(),
	excerpt: z.string(),
	body: z.string()
});

export const postSchema = z.object({
	id: z.string(),
	slug: z.string(),
	translations: z.record(localeSchema, postTranslationSchema),
	tags: z.array(z.string()),
	author: authorSchema,
	publishedAt: z.iso.datetime(),
	readingTimeMinutes: z.number().int().positive(),
	coverColor: z.string().regex(/^#[0-9a-fA-F]{6}$/)
});

export const userRoleSchema = z.enum(['admin', 'editor', 'viewer']);

export const userSchema = z.object({
	id: z.string(),
	email: z.email(),
	password: z.string(),
	name: z.string(),
	role: userRoleSchema
});

export const userListSchema = z.array(userSchema);

export const itemOwnerSchema = z.object({
	id: z.string(),
	name: z.string()
});

export const itemSchema = z.object({
	id: z.string(),
	name: z.string(),
	status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'archived']),
	channel: z.enum(['email', 'sms', 'web', 'social', 'push']),
	owner: itemOwnerSchema,
	budget: z.number(),
	spent: z.number(),
	impressions: z.number().int(),
	clicks: z.number().int(),
	ctr: z.number().min(0).max(1),
	startDate: z.iso.date(),
	endDate: z.iso.date(),
	updatedAt: z.iso.datetime(),
	tags: z.array(z.string())
});

export const itemListSchema = z.array(itemSchema);

export const postListSchema = z.array(postSchema);

export const loginPayloadSchema = z.object({
	email: z.email(),
	password: z.string().min(1)
});

export const loginResultSchema = z.object({
	ok: z.boolean(),
	user: userSchema.optional(),
	message: z.string().optional()
});

export type Locale = z.infer<typeof localeSchema>;
export type Post = z.infer<typeof postSchema>;
export type User = z.infer<typeof userSchema>;
export type Item = z.infer<typeof itemSchema>;
export type LoginPayload = z.infer<typeof loginPayloadSchema>;
export type LoginResult = z.infer<typeof loginResultSchema>;
