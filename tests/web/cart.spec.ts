import { webTest as test } from '../fixtures';
import { expect } from '@playwright/test';

test('blacklist', async ({ basePage, page }) => {
    const p = basePage('/personal/revieworder');

    await p.goto(false);
    await p.btn_click('Proceed to checkout');
    await p.waitForLoad();

    await expect(page.locator('.overlay-modal-main')).toContainText(/We.re unable to proceed/);
    await expect(page.getByRole('button', { name: 'Go to StarHub App' })).toBeVisible();
});
