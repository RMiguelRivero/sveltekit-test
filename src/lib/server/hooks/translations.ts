import type { Handle } from '@sveltejs/kit';
import { DEFAULT_LOCALE, translations } from '$lib/i18n/constants';
import { isLocale } from '$lib/i18n/utils';

// `params.locale` is absent for routes outside the `[locale=locale]` subtree (e.g.
// `sitemap.xml`) and the `[...catchall]` root fallback has no `locale` param either.
// Falling back to `DEFAULT_LOCALE` rather than `null` keeps `locals.translations`
// a plain `Translation` everywhere, so nothing downstream needs to null-check it.
export const handleTranslations: Handle = async ({ event, resolve }) => {
	const { locale } = event.params;
	event.locals.translations =
		locale && isLocale(locale) ? translations[locale] : translations[DEFAULT_LOCALE];
	return resolve(event);
};
