import type { ReactElement } from 'react';
import { ImageResponse } from '@vercel/og';
import type { RequestHandler } from './$types';
import { getPost } from '$lib/server/api';
import type { Translation } from '$lib/i18n/constants';
import { SITE_NAME } from '$lib/components/seo.constants';

// Node, not edge: this route is stateless/read-only and edge was the original intent
// (low cold-start, globally distributed, good fit for crawler traffic), but
// @vercel/og@1.0.1's edge build unconditionally does
// `fetch(new URL('./Geist-Regular.ttf', import.meta.url))` for its fallback font — a
// blob-asset reference Vercel's edge bundler can't resolve outside Next.js's build,
// which fails deployment ("referencing unsupported modules: vc-blob-asset:...").
// Its Node build reads the same font via `fs.readFileSync` instead, which works. This
// also lines up with Vercel's own direction: Edge Functions are "essentially
// deprecated" platform-wide in favor of Fluid Compute on Node (sveltejs/kit#14253).
export const config = { runtime: 'nodejs20.x' };

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;

function h(type: string, props: Record<string, unknown>, children?: unknown): ReactElement {
	return { type, key: null, props: { ...props, children } } as unknown as ReactElement;
}

function readingTimeLabel(translations: Translation, minutes: number): string {
	return translations.blog.readingTime.replace('{minutes}', String(minutes));
}

function buildOgImageElement(
	title: string,
	authorName: string,
	readingTime: string,
	coverColor: string,
): ReactElement {
	return h(
		'div',
		{
			style: {
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				width: `${IMAGE_WIDTH}px`,
				height: `${IMAGE_HEIGHT}px`,
				padding: '64px',
				backgroundColor: coverColor,
				fontFamily: 'sans-serif',
			},
		},
		[
			h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } }, [
				h('div', {
					style: {
						display: 'flex',
						width: '28px',
						height: '28px',
						borderRadius: '8px',
						backgroundColor: 'rgba(255, 255, 255, 0.9)',
					},
				}),
				h(
					'span',
					{ style: { display: 'flex', fontSize: '28px', fontWeight: 700, color: 'white' } },
					SITE_NAME,
				),
			]),
			h(
				'div',
				{
					style: {
						display: 'flex',
						flexDirection: 'column',
						gap: '24px',
						padding: '40px',
						borderRadius: '24px',
						backgroundColor: 'rgba(0, 0, 0, 0.45)',
					},
				},
				[
					h(
						'span',
						{
							style: {
								display: 'flex',
								fontSize: '56px',
								fontWeight: 700,
								lineHeight: 1.25,
								color: 'white',
							},
						},
						title,
					),
					h(
						'span',
						{ style: { display: 'flex', fontSize: '28px', color: 'rgba(255, 255, 255, 0.85)' } },
						`${authorName} · ${readingTime}`,
					),
				],
			),
		],
	);
}

export const GET: RequestHandler = async ({ params, locals }) => {
	const post = await getPost(params.slug);
	if (!post) {
		return new Response('Not found', { status: 404 });
	}

	const translation = post.translations[params.locale];
	const element = buildOgImageElement(
		translation.title,
		post.author.name,
		readingTimeLabel(locals.translations, post.readingTimeMinutes),
		post.coverColor,
	);

	return new ImageResponse(element, {
		width: IMAGE_WIDTH,
		height: IMAGE_HEIGHT,
		headers: {
			// Lowercase to match (and overwrite) @vercel/og's own default "cache-control" key —
			// a differently-cased key would survive as a separate object property and get
			// merged into a combined, invalid header value instead of replacing the default.
			'cache-control': 'public, immutable, max-age=31536000',
		},
	});
};
