import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { getSelectedAccount, getAuthFilePath } from './tests/utils/auth';

dotenv.config();

const BASE_URL = process.env.BASE_URL ?? 'https://starhubltd-tst.outsystemsenterprise.com';

let authFile: string | undefined;
try {
    const selected = getSelectedAccount();
    authFile = getAuthFilePath(selected.email);
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

    timeout: 60_000,
    expect: {
        timeout: 10_000,
    },

    use: {
        headless: process.env.HEADLESS !== 'false',
        trace: 'on-first-retry',
        screenshot: 'on',
        video: 'on-first-retry',
        launchOptions: {
            slowMo: Number(process.env.SLOW_MO) || 0,
        },
    },

    projects: [
        // Runs login once and saves auth state
        {
            name: 'web-setup',
            testMatch: '**/web/*.setup.ts',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: BASE_URL,
            },
        },
        {
            name: 'app-setup',
            testMatch: '**/app/*.setup.ts',
            use: {
                ...devices['Galaxy S24'],
                baseURL: BASE_URL,
            },
        },

        // Web tests — reuse saved auth state
        {
            name: 'web-chromium',
            testMatch: '**/web/*.spec.ts',
            dependencies: authFile ? ['web-setup'] : [],
            use: {
                ...devices['Desktop Chrome'],
                baseURL: BASE_URL,
                storageState: authFile,
            },
        },

        // Mobile app tests
        {
            name: 'app-android',
            testMatch: '**/app/*.spec.ts',
            dependencies: authFile ? ['app-setup'] : [],
            use: {
                ...devices['Desktop Chrome'],
                baseURL: BASE_URL,
                storageState: authFile,
                viewport: { width: 320, height: 700 },
            },
        },
    ],
});
