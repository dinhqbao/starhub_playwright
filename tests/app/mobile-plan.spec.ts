import { appTest as test } from '../fixtures';
import { expect } from '@playwright/test';
import { BasePage } from '../pages/BasePage';

test.describe('simo', () => {
    let p: BasePage;

    test.beforeEach(async ({ basePage, page }) => {
        p = basePage('/Torpedo/MobilePlans');

        await p.openWithEmptyCart();
        await page.getByText('5G Unlimited+ Core').click();
        await p.btn_click('Next');
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
    });

    test('purchase', async ({ page }) => {
        await page.locator('.number-selection-list .number-selection-option').nth(0).click();
        await p.btn_click('Next');
        await page.getByRole('checkbox').check();
        await p.btn_click('Confirm and pay');

        await page
            .locator('[id=".security-code"]')
            .contentFrame()
            .getByRole('textbox', { name: 'Security Code' })
            .fill('123');
        await page.getByRole('button', { name: 'Proceed to checkout' }).click();
        // await p.btn_click('Confirm and pay');
        await page.pause();
    });

    test('soft blacklist', async ({ page }) => {
        await expect(page.locator('.overlay-modal-main')).toContainText(/We.*unable to proceed/);
        await expect(page.getByRole('button', { name: 'Make payment' })).toBeVisible();
    });
});
