import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { LOCALE_COOKIE_MAX_AGE_SECONDS, LOCALE_COOKIE_NAME } from '$lib/i18n/constants';
import { isLocale } from '$lib/i18n/utils';

// Persists the active locale so paths outside the `[locale=locale]` subtree (e.g. the
// root catch-all) can redirect into the user's last-used locale instead of always
// falling back to `DEFAULT_LOCALE`. Only writes when it actually changes, since this
// hook runs on every request within the locale subtree.
export const handleLocale: Handle = async ({ event, resolve }) => {
	const { locale } = event.params;
	const cookieLocale = event.cookies.get(LOCALE_COOKIE_NAME);
	if (locale && isLocale(locale) && cookieLocale !== locale) {
		event.cookies.set(LOCALE_COOKIE_NAME, locale, {
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax',
			path: '/',
			maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
		});
	}
	return resolve(event);
};
