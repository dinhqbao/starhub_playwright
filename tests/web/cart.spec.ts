import { webTest as test } from '../fixtures';
import { expect } from '@playwright/test';

test('blacklist', async ({ basePage, page }) => {
    const p = basePage('/personal/revieworder');

    await p.open();
    await p.btn_click('Proceed to checkout');
    await p.waitForLoad();

    await expect(page.locator('.overlay-modal-main')).toContainText(/We.*unable to proceed/);
    await expect(page.getByRole('button', { name: 'Go to StarHub App' })).toBeVisible();
});
