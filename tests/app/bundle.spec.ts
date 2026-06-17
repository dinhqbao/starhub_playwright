import { test, expect } from '@playwright/test';
import { SH_Page } from '../pages/SH_Page';

test('test', async ({ page }) => {
    const bundle = new SH_Page(page, '/Torpedo/BundlePLP?Type=broadband-entertainment');

    bundle.goto();
    await page
        .locator('.bundle-content-item')
        .filter({ hasText: '10Gbps Ultraspeed + 1 Pass' })
        .getByRole('button', { name: 'See bundle details' })
        .click();
    await bundle.btn_click('Add more items & services');
    await bundle.btn_click('Skip');
    await bundle.btn_click('Skip');
    await bundle.btn_click('Skip');
    await bundle.btn_click('Skip');
    await bundle.btn_click('Skip');
    await bundle.btn_click('Proceed to checkout');
});
