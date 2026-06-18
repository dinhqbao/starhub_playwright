import { test, expect } from '@playwright/test';
import { SH_Page } from '../pages/SH_Page';

test('blacklist', async ({ page }) => {
    const broadband = new SH_Page(page, '/personal/revieworder');

    await broadband.goto(false);
    await broadband.btn_click('Proceed to checkout');
    await broadband.waitForLoad();

    await expect(page.locator('.overlay-modal-main')).toContainText(/We.re unable to proceed/);
    await expect(page.getByRole('button', { name: 'Go to StarHub App' })).toBeVisible();
});
