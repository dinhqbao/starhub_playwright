import { appTest as test } from '../fixtures';
import { expect } from '@playwright/test';

test('buy broadband', async ({ page, shPage }) => {
    const broadband = shPage('/Torpedo/BroadbandPlansSN');

    await broadband.goto();
    await page.getByText('Home+ Core 5Gbps').click();
    await broadband.btn_click('Next');
    await broadband.btn_click('Skip');
    await broadband.btn_click('Skip');
    await broadband.btn_click('Proceed to checkout');
    await broadband.waitForLoad();
    await page.getByRole('button', { name: 'Get assistance' }).waitFor({ timeout: 15_000 });

    await expect(page.locator('.overlay-modal')).toContainText(/We.re unable to proceed/);
    await expect(page.locator('.overlay-modal')).toContainText(
        'Your current service has a pending request or an account-related issue. To proceed, please select another option.'
    );
    await expect(page.getByRole('button', { name: 'Get assistance' })).toBeVisible();
});
