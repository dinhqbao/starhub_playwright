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
    const sh = new SH_Page(page, '/Torpedo/More');
    await sh.goto(false);
    const isLoggedIn = !page.url().includes('LoginMain');
    if (isLoggedIn) await ctx.storageState({ path: authFile });
    await ctx.close();
    return isLoggedIn;
}

async function reAuthenticate(page: Page) {
    const account = getSelectedAccount();
    await page.getByRole('textbox', { name: 'Enter your email address' }).fill(account.email);
    await page.getByRole('textbox', { name: 'Enter your password' }).fill(account.password);
    await page.getByRole('button', { name: 'Log in with Hub ID' }).click();
    // Wait until we're off the login page — confirms auth completed before capturing state
    await page.waitForURL((url) => !url.pathname.includes('LoginMain'), { timeout: 30_000 });
}

setup('authenticate', async ({ browser }) => {
    if (existsSync(authFile)) {
        const valid = await checkSession(browser);
        if (valid) {
            console.log(`\nSession valid → .auth/${account.email}.json`);
            return;
        }
        console.log('\nSession expired, re-authenticating...');
    }

    // Fresh context — no stale cookies that could interfere with login
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const app_login = new SH_Page(page, '/Torpedo/LoginMain');
    await app_login.goto(false);
    await reAuthenticate(page);
    await ctx.storageState({ path: authFile });
    await ctx.close();
    console.log(`\nAuthenticated → .auth/${account.email}.json`);
});
