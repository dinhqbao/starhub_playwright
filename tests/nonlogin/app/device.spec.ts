import { test } from '@playwright/test';
import { preorderSteps, bauSteps } from '../../app/device.steps';

test('preorder', async ({ page }) => {
    await preorderSteps(page);
});

test('bau', async ({ page }) => {
    await bauSteps(page);
});
