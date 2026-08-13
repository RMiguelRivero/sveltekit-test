<script lang="ts" module>
	import type { Locale } from '$lib/i18n/constants';

	export interface SeoProps {
		title: string;
		description: string;
		locale: Locale;
		origin: string;
		path: string;
		image?: string;
		type?: 'website' | 'article';
		articlePublishedTime?: string;
		articleAuthor?: string;
	}

	function buildLocaleUrl(origin: string, locale: Locale, path: string): string {
		return `${origin}/${locale}${path}`;
	}
</script>

<script lang="ts">
	import { LOCALES } from '$lib/i18n/constants';
	import { OG_LOCALE_MAP } from './seo.constants';

	let {
		title,
		description,
		locale,
		origin,
		path,
		image,
		type = 'website',
		articlePublishedTime,
		articleAuthor,
	}: SeoProps = $props();

	const canonical = $derived(buildLocaleUrl(origin, locale, path));
	const alternateLocales = $derived(LOCALES.filter((candidate) => candidate !== locale));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />

	<link rel="canonical" href={canonical} />
	{#each LOCALES as candidate (candidate)}
		<link rel="alternate" hreflang={candidate} href={buildLocaleUrl(origin, candidate, path)} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={buildLocaleUrl(origin, LOCALES[0], path)} />

	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content={OG_LOCALE_MAP[locale]} />
	{#each alternateLocales as candidate (candidate)}
		<meta property="og:locale:alternate" content={OG_LOCALE_MAP[candidate]} />
	{/each}
	{#if image}
		<meta property="og:image" content={image} />
	{/if}
	{#if type === 'article' && articlePublishedTime}
		<meta property="article:published_time" content={articlePublishedTime} />
	{/if}
	{#if type === 'article' && articleAuthor}
		<meta property="article:author" content={articleAuthor} />
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	{#if image}
		<meta name="twitter:image" content={image} />
	{/if}
</svelte:head>
