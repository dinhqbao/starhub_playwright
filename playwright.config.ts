import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { getSelectedAccount, getAuthFilePath } from './tests/utils/auth';

dotenv.config();

const BASE_URL = process.env.BASE_URL ?? 'https://starhubltd-tst.outsystemsenterprise.com';

let authFile: string | undefined;
try {
    const selected = getSelectedAccount();
    const path = getAuthFilePath(selected.email);
    authFile = existsSync(path) ? path : undefined;
} catch {
    authFile = undefined;
}

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
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
        // Web tests — session checked per-test via webTest fixture
        {
            name: 'web-chromium',
            testMatch: 'tests/web/*.spec.ts',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: BASE_URL,
                storageState: authFile,
            },
        },

        // Mobile app tests — session checked per-test via appTest fixture
        {
            name: 'app-android',
            testMatch: 'tests/app/*.spec.ts',
            use: {
                ...devices['Galaxy S24'],
                baseURL: BASE_URL,
                storageState: authFile,
            },
        },

        // Non-login flows
        {
            name: 'app-nonlogin',
            testMatch: 'tests/nonlogin/app/*.spec.ts',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: BASE_URL,
                viewport: { width: 320, height: 700 },
            },
        },
        {
            name: 'web-nonlogin',
            testMatch: 'tests/nonlogin/web/*.spec.ts',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: BASE_URL,
            },
        },
    ],
});
