import { expect, test } from '@playwright/test';

// Search lives on `/blog` itself (URL-synced `q`, alongside the existing tag/sort
// filters) rather than a separate `/search` route — see the blog `+page.server.ts`
// comment for why. This flow still exercises the same thing the brief asks for:
// anonymous search -> click a result -> land on the post detail page.
test('anonymous visitor can search the blog and open a matching post', async ({ page }) => {
	await page.goto('/en/blog');
	// Under parallel/CPU-constrained test runs, `fill()` can land before Svelte finishes
	// hydrating and attaching its reactive input listener — the typed value would sit in
	// the DOM unobserved and the debounced search would never fire. Waiting for the
	// network to go idle gives the page's module script time to load and hydrate first.
	await page.waitForLoadState('networkidle');

	const searchInput = page.getByLabel('Search');
	await searchInput.fill('pragmatic design token');

	// Generous timeout: the debounced client-side goto() only updates the URL once its
	// SSR round-trip resolves, and that round-trip shares one Node preview server with
	// every other parallel worker/test in this suite.
	await expect(page).toHaveURL(/[?&]q=pragmatic\+design\+token/, { timeout: 10_000 });

	const resultHeading = page.getByRole('heading', {
		level: 2,
		name: 'A pragmatic design token system',
	});
	await expect(resultHeading).toBeVisible();
	await expect(page.getByRole('heading', { level: 2 })).toHaveCount(1);

	await page.getByRole('link', { name: 'Read post' }).click();

	await expect(page).toHaveURL(/\/en\/blog\/a-pragmatic-design-token-system$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'A pragmatic design token system',
	);
});
