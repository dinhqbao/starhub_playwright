import { test, expect } from '@playwright/test';
import { BasePage } from '../pages/SH_Page';

test('blacklist', async ({ page }) => {
    const broadband = new BasePage(page, '/personal/revieworder');

    await broadband.goto(false);
    await broadband.btn_click('Proceed to checkout');
    await broadband.waitForLoad();

    await expect(page.locator('.overlay-modal-main')).toContainText(/We.re unable to proceed/);
    await expect(page.getByRole('button', { name: 'Go to StarHub App' })).toBeVisible();
});
