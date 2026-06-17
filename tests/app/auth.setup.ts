import { test as setup, Browser } from '@playwright/test';
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { getSelectedAccount, getAuthFilePath } from '../utils/auth';

dotenv.config();

const account = getSelectedAccount();
const authFile = getAuthFilePath(account.email);

async function checkSession(browser: Browser): Promise<boolean> {
    const ctx = await browser.newContext({ storageState: authFile });
    const page = await ctx.newPage();
    await page.goto('/Torpedo/More');
    await page.waitForLoadState('networkidle');
    const isLoggedIn = !page.url().includes('LoginMain');
    if (isLoggedIn) await ctx.storageState({ path: authFile });
    await ctx.close();
    return isLoggedIn;
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
    await page.goto('/Torpedo/LoginMain');
    await reAuthenticate(page);
    await ctx.storageState({ path: authFile });
    await ctx.close();
    console.log(`\nAuthenticated → .auth/${account.email}.json`);
});

async function reAuthenticate(page: import('@playwright/test').Page) {
    const account = getSelectedAccount();
    await page.getByRole('textbox', { name: 'Enter your email address' }).fill(account.email);
    await page.getByRole('textbox', { name: 'Enter your password' }).fill(account.password);
    await page.getByRole('button', { name: 'Log in with Hub ID' }).click();
    await page.waitForLoadState('networkidle');
}
