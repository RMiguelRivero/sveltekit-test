import { z } from 'zod';
import { localeSchema } from './common';

export const tagSchema = z
	.object({
		slug: z.string(),
		label: z.record(localeSchema, z.string()),
	})
	.meta({ id: 'tagSchema' });

export const tagListSchema = z.array(tagSchema).meta({ id: 'tagListSchema' });

export type Tag = z.infer<typeof tagSchema>;
