import { z } from 'zod';
import { localeSchema } from './common';

export const authorSchema = z
	.object({
		id: z.string(),
		name: z.string(),
		avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
	})
	.meta({ id: 'authorSchema' });

export const postTranslationSchema = z
	.object({
		title: z.string(),
		excerpt: z.string(),
		body: z.string(),
	})
	.meta({ id: 'postTranslationSchema' });

export const postSchema = z
	.object({
		id: z.string(),
		slug: z.string(),
		translations: z.record(localeSchema, postTranslationSchema),
		tags: z.array(z.string()),
		author: authorSchema,
		publishedAt: z.iso.datetime(),
		readingTimeMinutes: z.number().int().positive(),
		coverColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
	})
	.meta({ id: 'postSchema' });

export const postListSchema = z.array(postSchema).meta({ id: 'postListSchema' });

export type Post = z.infer<typeof postSchema>;
