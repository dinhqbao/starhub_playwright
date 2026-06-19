import { webTest as test } from '../fixtures';
import { preorderSteps, bauSteps } from './device.steps';

test('preorder', async ({ page }) => {
    await preorderSteps(page);
});

test('bau', async ({ page }) => {
    await bauSteps(page);
});
