import { expect, test } from '@playwright/test';
import { loginAs } from './helpers/auth';

const ADMIN_EMAIL = 'admin@demo.test';
const ADMIN_PASSWORD = 'demo1234';

// `cmp_0002` ("Summer — Beta program #002") is a normal item — its update always
// succeeds. `cmp_0001` ("Upgrade — GA release #001") is the deterministic failure
// sentinel (SIMULATED_FAILURE_ITEM_ID) — its update always fails, so the optimistic
// UI has to roll back. Both ids/names come straight from static/mocks/items.json.
const NORMAL_ITEM_NAME = 'Summer — Beta program #002';
const SENTINEL_ITEM_NAME = 'Upgrade — GA release #001';

test.beforeEach(async ({ page }) => {
	await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
});

test('editing a campaign status updates optimistically and persists', async ({ page }) => {
	await page.goto('/en/dashboard/items?q=Beta+program+%23002');

	const row = page.getByRole('row').filter({ hasText: NORMAL_ITEM_NAME });
	await expect(row).toBeVisible();

	const statusSelect = row.locator('select');
	await expect(statusSelect).toHaveValue('completed');

	// The optimistic update lands in the DOM before the server round-trip resolves,
	// so wait for the actual mutation response — otherwise reloading immediately can
	// race the in-flight request and abort it before it reaches the server.
	const updateResponse = page.waitForResponse(
		(response) =>
			response.url().includes('?/updateStatus') && response.request().method() === 'POST',
	);
	await statusSelect.selectOption('active');
	await expect(statusSelect).toHaveValue('active');
	await updateResponse;
	await expect(page.getByRole('alert')).toHaveCount(0);

	// Reload to confirm the edit persisted through the server-side in-memory store,
	// not just the client's optimistic local state.
	await page.reload();
	const reloadedRow = page.getByRole('row').filter({ hasText: NORMAL_ITEM_NAME });
	await expect(reloadedRow.locator('select')).toHaveValue('active');
});

test('editing the sentinel campaign applies optimistically then rolls back on failure', async ({
	page,
}) => {
	await page.goto('/en/dashboard/items?q=GA+release+%23001');

	const row = page.getByRole('row').filter({ hasText: SENTINEL_ITEM_NAME });
	await expect(row).toBeVisible();

	const statusSelect = row.locator('select');
	await expect(statusSelect).toHaveValue('completed');

	await statusSelect.selectOption('active');
	// The optimistic update applies immediately, before the server responds.
	await expect(statusSelect).toHaveValue('active');

	// The server always rejects this specific item (the deterministic failure
	// sentinel), so the UI must roll back to the pre-edit value and surface an error —
	// this is the single most important assertion in the whole E2E suite.
	await expect(statusSelect).toHaveValue('completed', { timeout: 6000 });
	await expect(page.getByRole('alert')).toBeVisible();
});
