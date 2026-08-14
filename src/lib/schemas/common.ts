import { LOCALES } from '$lib/i18n/constants';
import { z } from 'zod';

export const localeSchema = z.enum(LOCALES).meta({ id: 'localeSchema' });

export type Locale = z.infer<typeof localeSchema>;
