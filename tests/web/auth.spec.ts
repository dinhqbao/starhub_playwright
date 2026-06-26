import { webTest as test } from '../fixtures';
import { expect } from '@playwright/test';

test('login', async ({ workerState, page }) => {
    if (workerState.isPhone) {
        await page.locator('.header-personal .header-myaccount-icon').click();
    } else {
        await page.locator('.header-group .header-myaccount-text').click();
    }

    await expect(
        page.locator('div.header-profile-tooltip-name > span').filter({ visible: true }).first()
    ).toContainText(new RegExp(workerState.email, 'i'));
});
