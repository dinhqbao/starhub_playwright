import { Page } from '@playwright/test';
import { emptyCart } from '../utils/cart';

export class SH_Page {
    private readonly url: string;

    constructor(
        private readonly page: Page,
        url: string
    ) {
        this.url = url;
    }

    async goto() {
        await this.page.goto(this.url);
        // await this.page.waitForLoadState('networkidle');
    }

    async web_waitForProfileTooltip() {
        const el = this.page.locator('div.header-profile-tooltip-name > span').first();
        await el.waitFor({ state: 'visible' });
    }

    async getCartCount(): Promise<number> {
        const el = this.page.locator('div.cart-count>span');
        if ((await el.count()) === 0) return 0;
        return parseInt(((await el.textContent()) || '').trim() || '0', 10);
    }

    async clearCartIfNeeded() {
        const count = await this.getCartCount();
        console.log(`[broadband] cart count: ${count}`);
        if (!Number.isNaN(count) && count >= 1) {
            await emptyCart(this.page);
            await this.goto();
        }

        console.log(`[broadband] cart cleared`);
    }

    async btn_click(name: string) {
        await this.page.getByRole('button', { name }).click();
    }

    async skip() {
        await this.page.getByRole('button', { name: 'Skip' }).click();
    }

    async wait(timeoutMs: number = 1000) {
        await this.page.waitForTimeout(timeoutMs);
    }
}
