import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { getSelectedAccount, getAuthFilePath } from './tests/utils/auth';

dotenv.config();

const BASE_URL = process.env.BASE_URL ?? 'https://starhubltd-tst.outsystemsenterprise.com';

let authFile: string | undefined;
if (process.env.NOAUTH !== 'true') {
    try {
        const selected = getSelectedAccount();
        const path = getAuthFilePath(selected.email);
        authFile = existsSync(path) ? path : undefined;
    } catch {
        authFile = undefined;
    }
}

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: [['html', { open: 'always' }], ['list']],

    timeout: 90_000,
    expect: {
        timeout: 10_000,
    },

    use: {
        headless: process.env.HEADLESS !== 'false',
        trace: 'on-first-retry',
        screenshot: 'on',
        video: 'on',
        launchOptions: {
            slowMo: Number(process.env.SLOW_MO) || 0,
        },
    },

    projects: [
        {
            name: 'web-chromium',
            testMatch: 'tests/web/*.spec.ts',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: BASE_URL,
                storageState: authFile,
            },
        },
        {
            name: 'app-android',
            testMatch: 'tests/app/*.spec.ts',
            use: {
                ...devices['Galaxy S24'],
                baseURL: BASE_URL,
                storageState: authFile,
            },
        },
    ],
});
