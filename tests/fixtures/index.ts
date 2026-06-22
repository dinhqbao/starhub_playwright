import { test as base, Page } from '@playwright/test';
import { BasePage, AppPage, WebPage } from '../pages/BasePage';
import { getSelectedAccount, getAuthFilePath } from '../utils/auth';

type SHFixtures = {
    basePage: (url: string) => BasePage;
};

type WorkerFixtures = {
    workerState: { isSessionRefreshed: boolean };
};

async function ensureAppSession(page: Page) {
    const account = getSelectedAccount();
    const authFile = getAuthFilePath(account.email);

    const sh = new AppPage(page, '/Torpedo/More');
    await sh.goto(false);

    if (page.url().includes('LoginMain')) {
        await page.getByRole('textbox', { name: 'Enter your email address' }).fill(account.email);
        await page.getByRole('textbox', { name: 'Enter your password' }).fill(account.password);
        await page.getByRole('button', { name: 'Log in with Hub ID' }).click();
        await page.waitForURL((url) => !url.pathname.includes('LoginMain'), { timeout: 30_000 });
        await page.context().storageState({ path: authFile });
        console.log(`[auth] app session refreshed → ${authFile}`);
    }
}

async function ensureWebSession(page: Page) {
    const account = getSelectedAccount();
    const authFile = getAuthFilePath(account.email);

    const sh = new WebPage(page, '/personal/store/mobile-plans');
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
        console.log(`[auth] web session refreshed → ${authFile}`);
    }
}

function makeTest<T extends BasePage>(
    ensureSession: (page: Page) => Promise<void>,
    PageClass: new (page: Page, url: string) => T
) {
    return base.extend<SHFixtures, WorkerFixtures>({
        workerState: [
            async ({}, use) => {
                await use({ isSessionRefreshed: false });
            },
            { scope: 'worker' },
        ],

        page: async ({ page, workerState }, use) => {
            if (!workerState.isSessionRefreshed && process.env.NOAUTH !== 'true') {
                await ensureSession(page);
                workerState.isSessionRefreshed = true;
            }
            await use(page);
        },

        basePage: async ({ page }, use) => {
            await use((url: string) => new PageClass(page, url));
        },
    });
}

export const appTest = makeTest(ensureAppSession, AppPage);
export const webTest = makeTest(ensureWebSession, WebPage);
