import { appTest as test } from '../fixtures';
import { expect } from '@playwright/test';

test('presale - purchase', async ({ basePage, page }) => {
    const p = basePage('/Torpedo/BroadbandPlansSN');

    await p.goto();
    await page.getByText('Home+ Core 5Gbps').click();
    await p.btn_click('Next');
    await p.btn_click('Skip');
    await p.btn_click('Skip');
    await p.btn_click('Proceed to checkout');
    await p.waitForLoad();

    await expect(page.locator('.overlay-modal-main')).toContainText(/We.*unable to proceed/);
});

test('postsale - transfer SN', async ({ basePage, page }) => {
    const p = basePage('/Torpedo/Broadband');

    await p.goto(false);
    await page.locator('div[aa_linktext="Ready to renew"]').getByRole('link').click();

    await expect(
        page.locator('div.header-content .header-right').locator(':scope > *')
    ).toHaveCount(0);
});
