import { test as base, Page } from '@playwright/test';
import { BasePage } from '../pages/SH_Page';
import { getSelectedAccount, getAuthFilePath } from '../utils/auth';

type SHFixtures = {
    shPage: (url: string) => BasePage;
};

async function ensureAppSession(page: Page) {
    const account = getSelectedAccount();
    const authFile = getAuthFilePath(account.email);

    const sh = new BasePage(page, '/Torpedo/More');
    await sh.goto(false);

    if (page.url().includes('LoginMain')) {
        await page.getByRole('textbox', { name: 'Enter your email address' }).fill(account.email);
        await page.getByRole('textbox', { name: 'Enter your password' }).fill(account.password);
        await page.getByRole('button', { name: 'Log in with Hub ID' }).click();
        await page.waitForURL((url) => !url.pathname.includes('LoginMain'), { timeout: 30_000 });
        await page.context().storageState({ path: authFile });
    }
}

async function ensureWebSession(page: Page) {
    const account = getSelectedAccount();
    const authFile = getAuthFilePath(account.email);

    const sh = new BasePage(page, '/personal/store/mobile-plans');
    await sh.goto(false);
    await page.locator('#b1-HeaderGroup').getByText('My Account', { exact: true }).click();
    await sh.waitForLoad();

    const isLoggedIn = await page
        .locator('div.header-profile-tooltip-name > span')
        .first()
        .isVisible();

    if (!isLoggedIn) {
        await page.getByRole('link', { name: 'Hub ID login' }).click();
        await page.getByRole('textbox', { name: 'Enter your email address' }).fill(account.email);
        await page.getByRole('textbox', { name: 'Enter your password' }).fill(account.password);
        await page.getByRole('button', { name: 'Log in' }).click();
        await page.waitForURL('**/personal/**', { timeout: 30_000 });
        await page.locator('#b1-HeaderGroup').getByText('My Account', { exact: true }).click();
        await page
            .locator('div.header-profile-tooltip-name > span')
            .first()
            .waitFor({ state: 'visible' });
        await page.context().storageState({ path: authFile });
    }
}

export const appTest = base.extend<SHFixtures>({
    page: async ({ page }, use) => {
        await ensureAppSession(page);
        await use(page);
    },
    shPage: async ({ page }, use) => {
        await use((url: string) => new BasePage(page, url));
    },
});

export const webTest = base.extend<SHFixtures>({
    page: async ({ page }, use) => {
        await ensureWebSession(page);
        await use(page);
    },
    shPage: async ({ page }, use) => {
        await use((url: string) => new BasePage(page, url));
    },
});
