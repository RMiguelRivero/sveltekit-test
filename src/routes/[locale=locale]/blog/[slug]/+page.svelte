<script lang="ts">
	import { resolve } from '$app/paths';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import type { Locale } from '$lib/i18n/constants';
	import type { PageData } from './$types';
	import { toPathname } from '$lib/utils/toPathname';
	import { jsonLdScriptTag } from '$lib/utils/jsonLd';

	const SITE_NAME = 'Demo Co.';

	interface ArticleJsonLd {
		'@context': 'https://schema.org';
		'@type': 'Article';
		headline: string;
		description: string;
		author: { '@type': 'Person'; name: string };
		datePublished: string;
		image: string;
		publisher: { '@type': 'Organization'; name: string };
	}

	interface BreadcrumbJsonLd {
		'@context': 'https://schema.org';
		'@type': 'BreadcrumbList';
		itemListElement: Array<{
			'@type': 'ListItem';
			position: number;
			name: string;
			item: string;
		}>;
	}

	// Route colocated with the page, matching the endpoint step 08-og-images creates.
	function buildOgImageUrl(origin: string, locale: Locale, slug: string): string {
		return `${origin}/${locale}/blog/${slug}/opengraph-image`;
	}

	function buildArticleJsonLd(
		origin: string,
		locale: Locale,
		slug: string,
		title: string,
		excerpt: string,
		authorName: string,
		publishedAt: string,
	): ArticleJsonLd {
		return {
			'@context': 'https://schema.org',
			'@type': 'Article',
			headline: title,
			description: excerpt,
			author: { '@type': 'Person', name: authorName },
			datePublished: publishedAt,
			image: buildOgImageUrl(origin, locale, slug),
			publisher: { '@type': 'Organization', name: SITE_NAME },
		};
	}

	function buildBreadcrumbJsonLd(
		origin: string,
		locale: Locale,
		slug: string,
		homeLabel: string,
		blogLabel: string,
		postTitle: string,
	): BreadcrumbJsonLd {
		return {
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: homeLabel, item: `${origin}/${locale}` },
				{
					'@type': 'ListItem',
					position: 2,
					name: blogLabel,
					item: `${origin}/${locale}/blog`,
				},
				{
					'@type': 'ListItem',
					position: 3,
					name: postTitle,
					item: `${origin}/${locale}/blog/${slug}`,
				},
			],
		};
	}

	let { data }: { data: PageData } = $props();
	let post = $derived(data.post);
	let translation = $derived(post.translations[data.locale]);
	let initials = $derived(
		post.author.name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase(),
	);
	let backHref = $derived(resolve(toPathname(`/${data.locale}/blog`)));

	let articleJsonLd = $derived(
		buildArticleJsonLd(
			data.origin,
			data.locale,
			post.slug,
			translation.title,
			translation.excerpt,
			post.author.name,
			post.publishedAt,
		),
	);
	let breadcrumbJsonLd = $derived(
		buildBreadcrumbJsonLd(
			data.origin,
			data.locale,
			post.slug,
			data.translations.nav.home,
			data.translations.nav.blog,
			translation.title,
		),
	);

	function readingTimeLabel(minutes: number): string {
		return data.translations.blog.readingTime.replace('{minutes}', String(minutes));
	}
</script>

<Seo
	title={`${translation.title} — ${SITE_NAME}`}
	description={translation.excerpt}
	locale={data.locale}
	origin={data.origin}
	path={`/blog/${post.slug}`}
	type="article"
	image={buildOgImageUrl(data.origin, data.locale, post.slug)}
	articlePublishedTime={post.publishedAt}
	articleAuthor={post.author.name}
/>

<svelte:head>
	<!-- eslint-disable svelte/no-at-html-tags -- server-built JSON-LD, escaped in jsonLdScriptTag to prevent </script> breakout -->
	{@html jsonLdScriptTag(articleJsonLd)}
	{@html jsonLdScriptTag(breadcrumbJsonLd)}
	<!-- eslint-enable svelte/no-at-html-tags -->
</svelte:head>

<Container size="md" class="py-8">
	<Button href={backHref} variant="ghost" class="mb-6">
		{data.translations.blog.backToBlog}
	</Button>

	<Card class="p-6">
		<Heading level={1} class="mb-4">{translation.title}</Heading>
		<div class="mb-4 flex flex-col items-center justify-between gap-2 sm:flex-row sm:items-center">
			<div class="flex items-center gap-2">
				<div
					class="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
					style:background-color={post.author.avatarColor}
				>
					{initials}
				</div>
				<p>{post.author.name}</p>
			</div>
			<time datetime={post.publishedAt} class="text-sm whitespace-nowrap text-muted-foreground">
				{new Date(post.publishedAt).toLocaleDateString(data.locale)}
			</time>
		</div>

		<p class="mb-4 leading-relaxed text-foreground">
			{translation.body}
		</p>
		<div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:text-sm">
			<span class="text-muted-foreground">{readingTimeLabel(post.readingTimeMinutes)}</span>
			<div class="flex flex-wrap gap-2">
				{#each post.tags as tag (tag)}
					<Badge variant="outline">{tag}</Badge>
				{/each}
			</div>
		</div>
	</Card>
</Container>
