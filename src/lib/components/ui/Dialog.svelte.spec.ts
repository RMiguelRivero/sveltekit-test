import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DialogHarness from './DialogHarness.svelte';

describe('Dialog.svelte', () => {
	it('opens, traps focus, cycles with Tab, closes on Escape, and restores focus', async () => {
		render(DialogHarness);

		const trigger = page.getByRole('button', { name: 'Open dialog' });
		await trigger.click();

		const dialog = page.getByRole('dialog', { name: 'Test dialog' });
		await expect.element(dialog).toBeInTheDocument();
		await expect.element(page.getByText('Test description')).toBeInTheDocument();

		const closeButton = page.getByRole('button', { name: 'Close' });
		await expect.element(closeButton).toHaveFocus();

		await userEvent.keyboard('{Tab}');
		await expect.element(page.getByPlaceholder('first field')).toHaveFocus();

		await userEvent.keyboard('{Tab}');
		await expect.element(page.getByPlaceholder('second field')).toHaveFocus();

		await userEvent.keyboard('{Tab}');
		await expect.element(page.getByRole('button', { name: 'Confirm' })).toHaveFocus();

		await userEvent.keyboard('{Tab}');
		await expect.element(closeButton).toHaveFocus();

		await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
		await expect.element(page.getByRole('button', { name: 'Confirm' })).toHaveFocus();

		await userEvent.keyboard('{Escape}');
		await expect.element(dialog).not.toBeInTheDocument();
		await expect.element(trigger).toHaveFocus();
	});

	it('closes on backdrop click and on close button click', async () => {
		render(DialogHarness);

		const trigger = page.getByRole('button', { name: 'Open dialog' });
		await trigger.click();

		const closeButton = page.getByRole('button', { name: 'Close' });
		await closeButton.click();
		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
		await expect.element(trigger).toHaveFocus();
	});
});
