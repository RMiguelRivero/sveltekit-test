import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import { toPathname } from '$lib/utils/toPathname';
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME } from '$lib/i18n/constants';
import { resolveFallbackLocale } from '$lib/i18n/utils';

export const load: PageServerLoad = ({ cookies }) => {
	const locale = resolveFallbackLocale(cookies.get(LOCALE_COOKIE_NAME)) ?? DEFAULT_LOCALE;
	redirect(307, resolve(toPathname(`/${locale}`)));
};
