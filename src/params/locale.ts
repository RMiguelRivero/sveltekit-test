import type { ParamMatcher } from '@sveltejs/kit';
import { type Locale, LOCALES_SET } from '$lib/i18n/constants';

export const match = ((param: string): param is Locale => {
	return LOCALES_SET.has(param);
}) satisfies ParamMatcher;
