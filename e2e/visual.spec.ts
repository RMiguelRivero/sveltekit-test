import { expect, test } from '@playwright/test';

// The landing hero is static (no animation, no auth, no streamed/async content) and
// scoped to a single <section>, which keeps this snapshot stable across runs instead
// of picking up unrelated below-the-fold changes.
test('landing page hero renders as expected', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' });
	await page.goto('/en');

	const hero = page.locator('section[aria-labelledby="hero-title"]');
	await expect(hero).toBeVisible();

	await expect(hero).toHaveScreenshot('landing-hero.png', { animations: 'disabled' });
});
