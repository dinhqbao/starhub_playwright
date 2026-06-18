import { test, expect } from '@playwright/test';
import { SH_Page } from '../pages/SH_Page';

test('blacklist', async ({ page }) => {
    const broadband = new SH_Page(page, '/Torpedo/OneCart_ReviewOrder');

    await broadband.goto(false);
    await broadband.btn_click('Proceed to checkout');
    await broadband.waitForLoad();

    await expect(page.locator('.overlay-modal-main')).toContainText(/We.re unable to proceed/);
    const getAssistance = page.getByRole('button', { name: 'Get assistance' });
    const makePayment = page.getByRole('button', { name: 'Make a payment now' });
    await expect(getAssistance.or(makePayment)).toBeVisible();
});
