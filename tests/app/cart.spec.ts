import { appTest as test } from '../fixtures';
import { expect } from '@playwright/test';

test('blacklist', async ({ basePage, page }) => {
    const p = basePage('/Torpedo/OneCart_ReviewOrder');

    await p.open();
    await p.btn_click('Proceed to checkout');
    await p.waitForLoad();

    await expect(page.locator('.overlay-modal-main')).toContainText(/We.*unable to proceed/);
    const getAssistance = page.getByRole('button', { name: 'Get assistance' });
    const makePayment = page.getByRole('button', { name: 'Make a payment now' });
    await expect(getAssistance.or(makePayment)).toBeVisible();
});
