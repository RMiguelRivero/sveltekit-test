import enI18n from './en.json';
import deI18n from './de.json';
import { unflatten, type Unflatten } from './utils';

type DotTranslation = typeof enI18n;
export type Translation = Unflatten<DotTranslation>;

export const LOCALES = ['en', 'de'] as const;
export const LOCALES_SET: Set<string> = new Set(LOCALES);
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, string> = {
	en: 'English',
	de: 'Deutsch',
};

export const translations: Record<Locale, Translation> = {
	en: unflatten(enI18n),
	de: unflatten(deI18n),
};
