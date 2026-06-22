import { Page } from '@playwright/test';

export class BasePage {
    protected readonly page: Page;
    private readonly url: string;
    protected readonly cartUrl: string = '';

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
        console.log(`[cart] items count: ${count}`);
        if (!Number.isNaN(count) && count >= 1) {
            await this.emptyCart();
            await this.goto(false);
        }
    }

    protected async emptyCart(): Promise<void> {
        if (!this.cartUrl) return;
        await this.page.goto(this.cartUrl);
        await this.waitForLoad();
        const deleteBtns = this.page
            .locator('i.t-icon.icon-ic_fluent_delete_20_regular')
            .filter({ visible: true });
        while (true) {
            var count = await deleteBtns.count();

            if (count === 0) {
                console.log(`[cart] cleared`);
                break;
            }
            console.log(`[cart] delete buttons count: ${count}`);
            await deleteBtns.first().click();
            try {
                const confirmBtn = this.page.getByRole('button', { name: 'Yes, delete' });
                await confirmBtn.waitFor({ state: 'visible', timeout: 1_000 });
                await confirmBtn.click();
            } catch (e) {
                console.log(e);
                // button didn't appear, nothing to do
            }
            await this.waitForLoad();
        }
        await this.page.getByText('Your cart is empty').waitFor();
    }

    async btn_click(name: string) {
        await this.page.getByRole('button', { name }).click();
        await this.waitSecond();
    }

    async skip() {
        await this.page.getByRole('button', { name: 'Skip' }).click();
    }

    async waitSecond(timeoutMs: number = 500) {
        await this.page.waitForTimeout(timeoutMs);
    }

    async waitForLoad(timeoutMs: number = 5_000) {
        await this.waitSecond();
        await this.page.waitForLoadState('networkidle', { timeout: timeoutMs }).catch(() => {});
        await this.waitSecond(1000);
    }
}

export class AppPage extends BasePage {
    protected readonly cartUrl = '/Torpedo/OneCart_ReviewOrder';
}

export class WebPage extends BasePage {
    protected readonly cartUrl = '/personal/revieworder';
}
