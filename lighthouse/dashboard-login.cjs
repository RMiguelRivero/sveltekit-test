// Puppeteer script for Lighthouse CI's authenticated dashboard collect (see
// lighthouserc.dashboard.json). LHCI keeps this browser instance open across every URL
// in that config's `collect.url` list, so logging in once here carries the resulting
// session cookie into all of them. CommonJS (`.cjs`) because LHCI loads this file with
// `require()`, which can't load a plain `.js` file in this package ("type": "module").
//
// Uses the same mock demo admin credentials as e2e/dashboard-optimistic-edit.spec.ts,
// driving the real login form rather than reimplementing the HMAC session-cookie
// signing from src/lib/server/auth/session.ts — one less place for auth logic to drift.
//
// Two decisions specific to lighthouserc.dashboard.json worth calling out:
// - `categories:seo` is asserted "off" there, not >=0.95. The dashboard is intentionally
//   `noindex` with no meta description (it's an authenticated, private page) — those are
//   exactly the two audits SEO ≥0.95 would demand we "fix", which would mean actively
//   regressing real SEO/security hygiene just to satisfy the gate. SEO stays enforced at
//   >=0.95 on the public surface (lighthouserc.json), where it's a meaningful signal.
// - `total-blocking-time` (not `interaction-to-next-paint`) is used as the INP-equivalent
//   assertion. Lighthouse only reports `interaction-to-next-paint` when a real interaction
//   happens during the trace; a plain navigation-only collect (no clicks/typing beyond
//   this login script) never produces one, so asserting on it would just error on a
//   missing audit. TBT is the standard lab-metric proxy for INP in this scenario.
const ADMIN_EMAIL = 'admin@demo.test';
const ADMIN_PASSWORD = 'demo1234';

/**
 * @param {import('puppeteer').Browser} browser
 * @param {{url: string, options: object}} context
 */
module.exports = async (browser, context) => {
	const loginUrl = new URL('/en/login', context.url).href;
	const page = await browser.newPage();

	await page.goto(loginUrl, { waitUntil: 'networkidle0' });
	await page.type('#email', ADMIN_EMAIL);
	await page.type('#password', ADMIN_PASSWORD);
	await Promise.all([
		page.waitForNavigation({ waitUntil: 'networkidle0' }),
		page.click('button[type="submit"]'),
	]);

	if (!page.url().includes('/dashboard')) {
		throw new Error(`Dashboard login failed for Lighthouse CI: ended up at ${page.url()}`);
	}

	await page.close();
};
