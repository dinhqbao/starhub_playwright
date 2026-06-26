import { appTest as test } from '../fixtures';
import { expect } from '@playwright/test';

test('login', async ({ workerState, page }) => {
    await expect(page.locator('#b1-Header')).toContainText(new RegExp(workerState.email, 'i'));
});
