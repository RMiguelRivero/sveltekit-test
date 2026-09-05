import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// `vite preview` normally serves HTTP/1.1, which caps a browser to ~6 concurrent
// connections per origin — under Lighthouse CI's throttled mobile network model this
// queues the dashboard route's many small route/error-boundary chunks and inflates its
// simulated LCP "Render Delay" well past the 2s budget, even though real production
// (Vercel, HTTP/2) doesn't see this. Gated behind an env var so only the Lighthouse CI
// preview (see lighthouserc*.json) pays for TLS + HTTP/2 — Playwright's e2e preview
// (playwright.config.ts) keeps plain HTTP so its baseURL stays `http://localhost:4173`.
const useHttpsPreview = process.env.LHCI_HTTPS === '1';

export default defineConfig({
	server: {
		open: true,
	},
	plugins: [
		tailwindcss(),
		...(useHttpsPreview ? [basicSsl()] : []),
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
