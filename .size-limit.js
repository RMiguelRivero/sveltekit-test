// Budgets the *total* initial JS (shared framework runtime + route code) each surface
// loads on first visit, gzip-measured — not just each route's unique delta — per the
// take-home brief. Run `npm run build` first; see scripts/route-js-closure.mjs for why
// the file list is resolved dynamically instead of via static globs.
import { resolveRouteJsClosure } from './scripts/route-js-closure.mjs';

const cwd = process.cwd();

// 80KB / 150KB match the brief's own suggested defaults; no measured reason to deviate.
export default [
	{
		name: 'Public surface (landing + blog + blog/[slug]) — initial JS',
		path: resolveRouteJsClosure(cwd, [
			'/[locale=locale]',
			'/[locale=locale]/blog',
			'/[locale=locale]/blog/[slug]',
		]),
		gzip: true,
		limit: '80 KB',
	},
	{
		name: 'Dashboard (dashboard + dashboard/items) — initial JS',
		path: resolveRouteJsClosure(cwd, [
			'/[locale=locale]/dashboard',
			'/[locale=locale]/dashboard/items',
		]),
		gzip: true,
		limit: '150 KB',
	},
];
