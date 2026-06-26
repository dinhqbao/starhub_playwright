import { test as base, Page } from '@playwright/test';
import { BasePage, AppPage, WebPage } from '../pages/BasePage';
import { getSelectedAccount, getAuthFilePath } from '../utils/auth';

const IS_PHONE = process.env.PLATFORM === 'phone';

type SHFixtures = {
    basePage: (url: string) => BasePage;
};

type WorkerFixtures = {
    workerState: { isSessionRefreshed: boolean; email: string; isPhone: boolean };
};

async function ensureAppSession(page: Page) {
    const account = getSelectedAccount();
    const p = new AppPage(page, '/Torpedo/More');

    await p.open();

    let isLoggedIn = await page
        .locator('div.account-info')
        .filter({ visible: true })
        .first()
        .isVisible();
    console.log(`[auth] session check → isLoggedIn: ${isLoggedIn}`);

    if (!isLoggedIn) {
        console.log(`[auth] not logged in, attempting login for ${account.email}`);
        await page.getByRole('textbox', { name: 'Enter your email address' }).fill(account.email);
        await page.getByRole('textbox', { name: 'Enter your password' }).fill(account.password);
        await page.getByRole('button', { name: 'Log in with Hub ID' }).click();
        await p.waitForLoad();
    }
}

async function ensureWebSession(page: Page) {
    const account = getSelectedAccount();
    console.log(`[auth] platform: ${process.env.PLATFORM}, IS_PHONE: ${IS_PHONE}`);
    const p = new WebPage(page, '/personal/store/mobile-plans');
    await p.open();

    const checkLoggedIn = async () => {
        if (IS_PHONE) {
            await page.locator('.header-personal .header-myaccount-icon').click();
        } else {
            await page.locator('.header-group .header-myaccount-text').click();
        }
        try {
            await page
                .locator('div.header-profile-tooltip-name > span')
                .filter({ visible: true })
                .waitFor({ state: 'visible' });
            return true;
        } catch {
            return false;
        }
    };

    await page.pause();
    let isLoggedIn = await checkLoggedIn();
    console.log(`[auth] session check → isLoggedIn: ${isLoggedIn}`);

    if (!isLoggedIn) {
        console.log(`[auth] not logged in, attempting login for ${account.email}`);
        await page.getByRole('link', { name: 'Hub ID login' }).click();
        await page.getByRole('textbox', { name: 'Enter your email address' }).fill(account.email);
        await page.getByRole('textbox', { name: 'Enter your password' }).fill(account.password);
        await page.getByRole('button', { name: 'Log in' }).click();
        await p.waitForLoad();
        isLoggedIn = await checkLoggedIn();
        console.log(`[auth] re-check → isLoggedIn: ${isLoggedIn}`);
    }
}

function makeTest<T extends BasePage>(
    ensureSession: (page: Page) => Promise<void>,
    PageClass: new (page: Page, url: string) => T
) {
    return base.extend<SHFixtures, WorkerFixtures>({
        workerState: [
            async ({}, use) => {
                await use({
                    isSessionRefreshed: false,
                    email: getSelectedAccount().email,
                    isPhone: IS_PHONE,
                });
            },
            { scope: 'worker' },
        ],

        page: async ({ page, workerState }, use) => {
            console.log(`[auth] workerState.isSessionRefreshed: ${workerState.isSessionRefreshed}`);

            if (!workerState.isSessionRefreshed && process.env.NOAUTH !== 'true') {
                await ensureSession(page);
                const authFile = getAuthFilePath(workerState.email);
                await page.context().storageState({ path: authFile });
                console.log(`[auth] session refreshed → ${authFile}`);
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
