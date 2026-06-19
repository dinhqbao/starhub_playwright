import { appTest as test } from '../fixtures';

test('buy bundle', async ({ basePage, page }) => {
    const p = basePage('/Torpedo/BundlePLP?Type=broadband-entertainment');

    await p.goto();
    await page
        .locator('.bundle-content-item')
        .filter({ hasText: '10Gbps Ultraspeed + 1 Pass' })
        .getByRole('button', { name: 'See bundle details' })
        .click();
    await p.btn_click('Add more items & services');
    await p.btn_click('Skip');
    await p.btn_click('Skip');
    await p.btn_click('Skip');
    await p.btn_click('Skip');
    await p.btn_click('Skip');
    await p.btn_click('Proceed to checkout');
});
