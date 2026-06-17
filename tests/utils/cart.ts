import { Page } from '@playwright/test';

export async function emptyCart(page: Page): Promise<void> {
    await page.goto('/Torpedo/OneCart_ReviewOrder');
    await page.waitForLoadState('networkidle');
    while (true) {
        const deleteBtns = page.locator('i.t-icon.icon-ic_fluent_delete_20_regular');
        const count = await deleteBtns.count();
        console.log(`[emptyCart] delete buttons found: ${count}`);
        if (count === 0) break;
        const deleteBtn = deleteBtns.first();
        console.log(`[emptyCart] clicking delete button...`);
        await deleteBtn.click();
        await page.waitForLoadState('networkidle');
    }
    await page.getByText('Your cart is empty').waitFor();
}
