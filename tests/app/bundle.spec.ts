import { appTest as test } from '../fixtures';

test('buy bundle', async ({ page, shPage }) => {
    const bundle = shPage('/Torpedo/BundlePLP?Type=broadband-entertainment');

    await bundle.goto();
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
