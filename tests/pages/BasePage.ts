import { Page } from '@playwright/test';

export class BasePage {
    protected readonly page: Page;
    private readonly url: string;
    protected readonly cartUrl: string = '';
    protected readonly longTimeout: number = 3_000;
    protected readonly shortTimeout: number = 1_000;

    constructor(page: Page, url: string) {
        this.page = page;
        this.url = url;
    }

    async openWithEmptyCart() {
        await this.open();
        await this.clearCart();
    }

    async open() {
        if (!(this.page as any).__cursorScriptAdded) {
            (this.page as any).__cursorScriptAdded = true;
            console.log('[cursor] registering init script');
            await this.page.addInitScript(() => {
                window.addEventListener('DOMContentLoaded', () => {
                    if (document.getElementById('__sh_cursor')) {
                        console.log('[cursor] already in DOM, skipping');
                        return;
                    }
                    console.log('[cursor] injecting cursor element');
                    const cursor = document.createElement('div');
                    cursor.id = '__sh_cursor';
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
        }
        await this.page.goto(this.url);
        await this.waitForLoad();
    }

    async getCartCount(): Promise<number> {
        const el = this.page.locator('div.cart-count>span');
        await el
            .first()
            .waitFor({ state: 'visible', timeout: this.shortTimeout })
            .catch(() => {});
        if ((await el.count()) === 0) return 0;
        return parseInt(((await el.textContent()) || '').trim() || '0', 10);
    }

    async clearCart() {
        const count = await this.getCartCount();
        console.log(`[cart] items count: ${count}`);
        if (!Number.isNaN(count) && count >= 1) {
            await this.emptyCart();
            await this.open();
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
            await deleteBtns
                .first()
                .waitFor({ state: 'visible', timeout: this.longTimeout })
                .catch(() => {});
            var count = await deleteBtns.count();

            if (count === 0) {
                console.log(`[cart] cleared`);
                break;
            }
            console.log(`[cart] delete buttons count: ${count}`);
            await deleteBtns.first().click();
            const confirmBtn = this.page.getByRole('button', { name: 'Yes, delete' });
            await confirmBtn
                .waitFor({ state: 'visible', timeout: this.shortTimeout })
                .then(() => confirmBtn.click())
                .catch(() => {});
            await this.waitForLoad();
        }
    }

    async btn_click(name: string) {
        await this.page.getByRole('button', { name }).click();
        await this.waitSecond();
    }

    async skip() {
        await this.page.getByRole('button', { name: 'Skip' }).click();
    }

    async waitSecond(timeoutMs?: number) {
        await this.page.waitForTimeout(timeoutMs ?? this.shortTimeout);
    }

    async waitForLoad(timeoutMs?: number) {
        await this.waitSecond();
        await this.page
            .waitForLoadState('networkidle', { timeout: timeoutMs ?? this.longTimeout })
            .catch(() => {});
        await this.page.locator('div.splash-video-2').waitFor({ state: 'hidden' });
        await this.waitSecond();
    }
}

export class AppPage extends BasePage {
    protected readonly cartUrl = '/Torpedo/OneCart_ReviewOrder';
}

export class WebPage extends BasePage {
    protected readonly cartUrl = '/personal/revieworder';
}
