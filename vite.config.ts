import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	server: {
		open: true,
	},
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
			},

			// Adapter default stays Node; individual routes opt into 'edge' where it's a clear
			// win (stateless, read-only, crawler-fetched) via their own `export const config`.
			adapter: adapter(),

			alias: {
				classname: 'src/lib/utils/cn.ts',
			},

			prerender: {
				// Real origin for canonical/OG URLs baked into prerendered HTML — otherwise
				// SvelteKit defaults url.origin to the placeholder "http://sveltekit-prerender".
				origin: 'https://demo-co.example.com',
				handleHttpError: ({ path, message }) => {
					// /login and /dashboard are built in later steps of this scripted rebuild;
					// don't fail prerendering of already-static pages that link to them yet.
					if (/^\/(en|de)\/(login|dashboard)(\/|$)/.test(path)) {
						return;
					}
					throw new Error(message);
				},
			},
		}),
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }],
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
				},
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
				},
			},
		],
	},
});
