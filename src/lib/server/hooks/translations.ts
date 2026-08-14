import type { Handle } from '@sveltejs/kit';
import { DEFAULT_LOCALE, translations } from '$lib/i18n/constants';
import { isLocale } from '$lib/i18n/utils';

// Runs after the root-route guard, so any locale segment reaching here is either a
// valid `Locale` or absent (e.g. `sitemap.xml`, which has no locale prefix at all).
// Falling back to `DEFAULT_LOCALE` rather than `null` keeps `locals.translations`
// a plain `Translation` everywhere, so nothing downstream needs to null-check it.
export const handleTranslations: Handle = async ({ event, resolve }) => {
	const { locale } = event.params;
	event.locals.translations =
		locale && isLocale(locale) ? translations[locale] : translations[DEFAULT_LOCALE];
	return resolve(event);
};
