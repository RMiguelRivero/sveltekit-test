import { z } from 'zod';

export const itemOwnerSchema = z
	.object({
		id: z.string(),
		name: z.string(),
	})
	.meta({ id: 'itemOwnerSchema' });

export const itemStatusSchema = z
	.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'archived'])
	.meta({ id: 'itemStatusSchema' });

export const itemChannelSchema = z
	.enum(['email', 'sms', 'web', 'social', 'push'])
	.meta({ id: 'itemChannelSchema' });

export const itemSchema = z
	.object({
		id: z.string(),
		name: z.string(),
		status: itemStatusSchema,
		channel: itemChannelSchema,
		owner: itemOwnerSchema,
		budget: z.number(),
		spent: z.number(),
		impressions: z.number().int(),
		clicks: z.number().int(),
		ctr: z.number().min(0).max(1),
		startDate: z.iso.date(),
		endDate: z.iso.date(),
		updatedAt: z.iso.datetime(),
		tags: z.array(z.string()),
	})
	.meta({ id: 'itemSchema' });

export const itemListSchema = z.array(itemSchema).meta({ id: 'itemListSchema' });

export const itemUpdateSchema = z
	.object({
		id: z.string().min(1),
		status: itemStatusSchema,
	})
	.meta({ id: 'itemUpdateSchema' });

export type Item = z.infer<typeof itemSchema>;
export type ItemStatus = z.infer<typeof itemStatusSchema>;
export type ItemChannel = z.infer<typeof itemChannelSchema>;
export type ItemUpdate = z.infer<typeof itemUpdateSchema>;
