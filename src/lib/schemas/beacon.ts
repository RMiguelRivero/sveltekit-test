import { z } from 'zod';

export const webVitalNameSchema = z
	.enum(['LCP', 'INP', 'CLS', 'TTFB'])
	.meta({ id: 'webVitalNameSchema' });

export const webVitalRatingSchema = z
	.enum(['good', 'needs-improvement', 'poor'])
	.meta({ id: 'webVitalRatingSchema' });

export const webVitalEventSchema = z
	.object({
		type: z.literal('web-vital'),
		name: webVitalNameSchema,
		value: z.number(),
		id: z.string(),
		rating: webVitalRatingSchema,
		path: z.string(),
	})
	.meta({ id: 'webVitalEventSchema' });

export const clientErrorEventSchema = z
	.object({
		type: z.literal('client-error'),
		message: z.string(),
		status: z.number().int().optional(),
		path: z.string().optional(),
		stack: z.string().optional(),
	})
	.meta({ id: 'clientErrorEventSchema' });

export const beaconEventSchema = z
	.discriminatedUnion('type', [webVitalEventSchema, clientErrorEventSchema])
	.meta({ id: 'beaconEventSchema' });

export type WebVitalName = z.infer<typeof webVitalNameSchema>;
export type WebVitalRating = z.infer<typeof webVitalRatingSchema>;
export type WebVitalEvent = z.infer<typeof webVitalEventSchema>;
export type ClientErrorEvent = z.infer<typeof clientErrorEventSchema>;
export type BeaconEvent = z.infer<typeof beaconEventSchema>;
