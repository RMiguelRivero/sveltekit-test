import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: 'e2e',
	fullyParallel: true,
	retries: process.env.CI ? 2 : 0,
	// HTML report only in CI, where step 19's workflow uploads it as an artifact so a
	// failing run's evidence is inspectable without re-running locally; `list` alone
	// locally keeps terminal output quiet and skips writing a report nobody opens.
	reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
	use: {
		baseURL: BASE_URL,
		trace: 'on-first-retry',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	// Build + preview (not `dev`) so E2E runs against the same production build that
	// ships — closer to real behavior (SSR/ISR output, no dev-only warnings) at the
	// cost of a slower startup than `vite dev`. Step 19's CI pipeline reuses this
	// exact config, so its runs get the same production-build guarantee.
	webServer: {
		command: 'npm run build && npm run preview',
		url: BASE_URL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
