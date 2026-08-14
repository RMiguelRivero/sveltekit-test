import type { ParamMatcher } from '@sveltejs/kit';
import { isLocale } from '$lib/i18n/utils';

export const match = isLocale satisfies ParamMatcher;
