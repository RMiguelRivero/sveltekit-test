import { LOCALES, type Locale } from '$lib/i18n/constants';
import { getPosts } from '$lib/server/api';
import type { RequestHandler } from './$types';

export const prerender = true;

function buildLocaleUrl(origin: string, locale: Locale, path: string): string {
	return `${origin}/${locale}${path}`;
}

function buildAlternateLinks(origin: string, path: string): string {
	const localeLinks = LOCALES.map(
		(locale) =>
			`<xhtml:link rel="alternate" hreflang="${locale}" href="${buildLocaleUrl(origin, locale, path)}" />`,
	).join('');
	const defaultLink = `<xhtml:link rel="alternate" hreflang="x-default" href="${buildLocaleUrl(origin, LOCALES[0], path)}" />`;

	return `${localeLinks}${defaultLink}`;
}

function buildUrlEntry(origin: string, locale: Locale, path: string): string {
	return `<url><loc>${buildLocaleUrl(origin, locale, path)}</loc>${buildAlternateLinks(origin, path)}</url>`;
}

// Paths are locale-agnostic suffixes (prefixed with a locale segment per <url> entry
// below). `/search` isn't included: it has no distinct indexable content of its own —
// the blog list already covers tag filtering — and stays out unless that changes.
async function getIndexablePaths(): Promise<string[]> {
	const postPaths = (await getPosts()).map((post) => `/blog/${post.slug}`);

	return ['', '/blog', ...postPaths];
}

export const GET: RequestHandler = async ({ url }) => {
	const paths = await getIndexablePaths();
	const urls = paths.flatMap((path) =>
		LOCALES.map((locale) => buildUrlEntry(url.origin, locale, path)),
	);

	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`;

	return new Response(body, {
		headers: { 'content-type': 'application/xml' },
	});
};
