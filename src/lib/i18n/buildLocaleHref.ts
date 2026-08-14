import type { Locale } from './constants';

export function buildLocaleHref(pathname: string, search: string, locale: Locale): string {
	const segments = pathname.split('/');
	segments[1] = locale;
	return `${segments.join('/')}${search}`;
}
