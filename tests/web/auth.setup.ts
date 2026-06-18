import { test as setup, Browser, Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { getSelectedAccount, getAuthFilePath } from '../utils/auth';
import { SH_Page } from '../pages/SH_Page';

dotenv.config();

const account = getSelectedAccount();
const authFile = getAuthFilePath(account.email);

async function checkSession(browser: Browser): Promise<boolean> {
    const ctx = await browser.newContext({ storageState: authFile });
    const page = await ctx.newPage();
    const sh = new SH_Page(page, '/personal/store/mobile-plans');
    await sh.goto(false);
    await page.locator('#b1-HeaderGroup').getByText('My Account', { exact: true }).click();
    await sh.waitForLoad();

    const isLoggedIn = await page
        .locator('div.header-profile-tooltip-name > span')
        .first()
        .isVisible();
    if (isLoggedIn) await ctx.storageState({ path: authFile });
    await ctx.close();
    return isLoggedIn;
}

async function reAuthenticate(page: Page) {
    const account = getSelectedAccount();
    const sh = new SH_Page(page, '/personal/store/mobile-plans');
    await page.getByRole('link', { name: 'Hub ID login' }).click();
    await page.getByRole('textbox', { name: 'Enter your email address' }).fill(account.email);
    await page.getByRole('textbox', { name: 'Enter your password' }).fill(account.password);
    await page.getByRole('button', { name: 'Log in' }).click();
    await sh.waitForLoad();
}

setup('authenticate', async ({ browser }) => {
    if (existsSync(authFile)) {
        const valid = await checkSession(browser);
        if (valid) {
            console.log(`\nSession valid, refreshed → .auth/${account.email}.json`);
            return;
        }
        console.log('\nSession expired, re-authenticating...');
    }

    // Fresh context — no stale cookies that could interfere with login
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const sh = new SH_Page(page, '/personal/store/mobile-plans');
    await sh.goto(false);
    await page.locator('#b1-HeaderGroup').getByText('My Account', { exact: true }).click();
    await reAuthenticate(page);
    await ctx.storageState({ path: authFile });
    await ctx.close();
    console.log(`\nAuthenticated → .auth/${account.email}.json`);
});
