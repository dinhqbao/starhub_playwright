import { test, expect } from '@playwright/test';
import { SH_Page } from '../pages/SH_Page';

test('buy broadband', async ({ page }) => {
    const broadband = new SH_Page(page, '/Torpedo/BroadbandPlansSN');

    await broadband.goto();
    await page.getByText('Home+ Core 5Gbps').click();
    await broadband.btn_click('Next');
    await broadband.btn_click('Skip');
    await broadband.btn_click('Skip');
    await broadband.btn_click('Proceed to checkout');
    await broadband.waitForLoad();
});
