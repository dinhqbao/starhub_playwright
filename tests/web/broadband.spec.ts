import { webTest as test } from '../fixtures';
import { expect } from '@playwright/test';

test('buy broadband', async ({ basePage, page }) => {
    const p = basePage('/personal/broadband/productssn');

    await p.openWithEmptyCart();
    await expect(
        page.getByText(
            'We got you with all-inclusive broadband plans. Select your Home+ plan. Home+'
        )
    ).toBeVisible();
    const plan = page.locator('.sn-bb-plan-card').filter({ hasText: 'Home+ Core 5Gbps' });
    await plan.getByRole('button', { name: 'Select plan' }).click();
    await p.btn_click('Skip');
    await p.btn_click('Skip');
    await p.btn_click('Proceed to checkout');
    await p.waitForLoad();
});
