import { webTest as test } from '../fixtures';
import { expect } from '@playwright/test';

test('simo', async ({ basePage, page }) => {
    const p = basePage('/personal/store/mobile-plans');

    await p.openWithEmptyCart();

    const plan = page.locator('.sn-plan-card').filter({ hasText: '5G Unlimited+ Core' });
    await plan.getByRole('button', { name: 'Select plan' }).click();
    await page.getByText('Sign up for a new line').click();
    // await page.getByText('Port-in from other telco').click();
    await p.btn_click('Next');
    await page.getByText('eSIM', { exact: true }).click();
    await p.btn_click('Next');
    // await p.btn_click('Accept and continue');
    await page.getByText('Block Overseas Calls').click();
    await page.getByText('Block Overseas SMSes').click();
    await p.btn_click('Next');
    await p.btn_click('Proceed to checkout');
    await p.waitForLoad();

    await expect(page.locator('.overlay-modal-main')).toContainText(/We.*unable to proceed/);
    await expect(page.getByRole('button', { name: 'Go to StarHub App' })).toBeVisible();
});
