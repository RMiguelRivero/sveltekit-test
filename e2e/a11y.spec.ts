import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { loginAs } from './helpers/auth';

test('dashboard items route has no serious or critical accessibility violations', async ({
	page,
}) => {
	await loginAs(page, 'admin@demo.test', 'demo1234');
	await page.goto('/en/dashboard/items');

	// Wait for the streamed rows to resolve — running axe against the skeleton would
	// miss violations that only exist in the loaded table markup (e.g. the per-row
	// status <select>s).
	await expect(page.locator('tbody tr').first()).toBeVisible();
	await expect(page.locator('tbody select').first()).toBeVisible();

	const results = await new AxeBuilder({ page }).analyze();
	const seriousOrCritical = results.violations.filter((violation) =>
		['serious', 'critical'].includes(violation.impact ?? ''),
	);

	expect(seriousOrCritical).toEqual([]);
});
