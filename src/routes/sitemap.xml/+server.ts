import { LOCALES, type Locale } from '$lib/i18n/constants';
import { getPosts } from '$lib/server/api';
import type { Post } from '$lib/schemas';
import type { RequestHandler } from './$types';

export const prerender = true;

type SitemapEntry = {
	path: string;
	lastmod?: string;
};

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

function buildUrlEntry(origin: string, locale: Locale, path: string, lastmod?: string): string {
	const lastmodTag = lastmod ? `\n<lastmod>${lastmod}</lastmod>` : '';

	return `<url>
<loc>${buildLocaleUrl(origin, locale, path)}</loc>${lastmodTag}
${buildAlternateLinks(origin, path)}</url>
`;
}

// `en-CA` is pinned deliberately (not a page's locale) since that locale's date format
// happens to be YYYY-MM-DD — sitemap dates must stay in W3C Datetime format regardless
// of which locale a <url> entry is for, not localized per visitor.
const LASTMOD_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC' });

// posts.json's publishedAt values carry no real time-of-day component (always
// T00:00:00Z) — a bare YYYY-MM-DD is more honest than implying precision that doesn't
// exist, and the spec explicitly allows omitting the time portion.
function toLastmodDate(publishedAt: string): string {
	return LASTMOD_DATE_FORMATTER.format(new Date(publishedAt));
}

// ISO datetime strings (enforced by postSchema's z.iso.datetime()) sort correctly as
// plain strings, so the max is just the lexicographically-last one.
function getLatestPublishedAt(posts: Post[]): string | undefined {
	const latest = posts
		.map((post) => post.publishedAt)
		.sort()
		.at(-1);

	return latest ? toLastmodDate(latest) : undefined;
}

function buildPostEntries(posts: Post[]): SitemapEntry[] {
	return posts.map((post) => ({
		path: `/blog/${post.slug}`,
		lastmod: toLastmodDate(post.publishedAt),
	}));
}

// Paths are locale-agnostic suffixes (prefixed with a locale segment per <url> entry
// below). There's no separate `/search` entry: search (tag/sort/query filtering) is
// built into `/blog` itself rather than a distinct route, and `/blog`'s own noindex
// rule already excludes the filtered/searched/paginated variants from indexing.
// `/` has no `lastmod` of its own — the landing page isn't post-derived content, and
// fabricating a date would be worse than the spec's own "optional" default.
async function getIndexableEntries(): Promise<SitemapEntry[]> {
	const posts = await getPosts();

	return [
		{ path: '' },
		{ path: '/blog', lastmod: getLatestPublishedAt(posts) },
		...buildPostEntries(posts),
	];
}

export const GET: RequestHandler = async ({ url }) => {
	const entries = await getIndexableEntries();
	const urls = entries.flatMap(({ path, lastmod }) =>
		LOCALES.map((locale) => buildUrlEntry(url.origin, locale, path, lastmod)),
	);

	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`;

	return new Response(body, {
		headers: { 'content-type': 'application/xml' },
	});
};
