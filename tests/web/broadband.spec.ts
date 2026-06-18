import { test, expect } from '@playwright/test';
import { SH_Page } from '../pages/SH_Page';

test('buy broadband', async ({ page }) => {
    const broadband = new SH_Page(page, '/personal/broadband/productssn');

    await broadband.goto();
    await expect(
        page.getByText(
            'We got you with all-inclusive broadband plans. Select your Home+ plan. Home+'
        )
    ).toBeVisible();

    const plan = page.locator('.sn-bb-plan-card').filter({ hasText: 'Home+ Core 5Gbps' });
    await plan.getByRole('button', { name: 'Select plan' }).click();

    await broadband.btn_click('Skip');
    await broadband.btn_click('Skip');
    await broadband.btn_click('Proceed to checkout');
    await broadband.waitForLoad();
});
