import { Page } from '@playwright/test';

export class BasePage {
    protected readonly page: Page;
    private readonly url: string;

    constructor(page: Page, url: string) {
        this.page = page;
        this.url = url;
    }

    async goto(shouldClearCart: boolean = true) {
        await this.page.addInitScript(() => {
            window.addEventListener('DOMContentLoaded', () => {
                const cursor = document.createElement('div');
                cursor.style.cssText = `
                    position: fixed;
                    width: 0;
                    height: 0;
                    pointer-events: none;
                    z-index: 999999;
                    transform: translate(-8px, -8px);
                `;
                cursor.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                        <circle cx="8" cy="8" r="7" fill="rgba(220,0,0,0.4)" stroke="red" stroke-width="1.5"/>
                    </svg>
                `;
                document.body.appendChild(cursor);
                document.addEventListener('mousemove', (e) => {
                    cursor.style.left = e.clientX + 'px';
                    cursor.style.top = e.clientY + 'px';
                });
            });
        });
        await this.page.goto(this.url);
        await this.waitForLoad();

        if (shouldClearCart) {
            await this.clearCart();
        }
    }

    async getCartCount(): Promise<number> {
        const el = this.page.locator('div.cart-count>span');
        if ((await el.count()) === 0) return 0;
        return parseInt(((await el.textContent()) || '').trim() || '0', 10);
    }

    async clearCart() {
        const count = await this.getCartCount();
        console.log(`[broadband] cart count: ${count}`);
        if (!Number.isNaN(count) && count >= 1) {
            await this.emptyCart();
            await this.goto(false);
            console.log(`[broadband] cart cleared`);
        }
    }

    protected async emptyCart(): Promise<void> {}

    async btn_click(name: string) {
        await this.page.getByRole('button', { name }).click();
    }

    async skip() {
        await this.page.getByRole('button', { name: 'Skip' }).click();
    }

    async waitSecond(timeoutMs: number = 1_000) {
        await this.page.waitForTimeout(timeoutMs);
    }

    async waitForLoad(timeoutMs: number = 10_000) {
        await this.page.waitForLoadState('networkidle', { timeout: timeoutMs }).catch(() => {});
    }
}

export class AppPage extends BasePage {
    protected async emptyCart() {
        await this.page.goto('/Torpedo/OneCart_ReviewOrder');
        await this.waitForLoad();
        while (true) {
            const deleteBtns = this.page.locator('i.t-icon.icon-ic_fluent_delete_20_regular');
            if ((await deleteBtns.count()) === 0) break;
            await deleteBtns.first().click();
            await this.waitForLoad();
        }
        await this.page.getByText('Your cart is empty').waitFor();
    }
}

export class WebPage extends BasePage {
    protected async emptyCart() {
        await this.page.goto('/personal/revieworder');
        await this.waitForLoad();
        while (true) {
            const deleteBtns = this.page.locator('i.t-icon.icon-ic_fluent_delete_20_regular');
            if ((await deleteBtns.count()) === 0) break;
            await deleteBtns.first().click();
            await this.waitForLoad();
        }
        await this.page.getByText('Your cart is empty').waitFor();
    }

    async waitForProfileTooltip() {
        await this.page.locator('div.header-profile-tooltip-name > span').first().waitFor({ state: 'visible' });
    }
}
