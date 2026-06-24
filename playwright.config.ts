import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { getSelectedAccount, getAuthFilePath } from './tests/utils/auth';

dotenv.config();

const BASE_URL = process.env.BASE_URL ?? 'https://starhubltd-tst.outsystemsenterprise.com';

let authFile: string | undefined;
let outputDir = 'test-results';

if (process.env.NOAUTH !== 'true') {
    try {
        const selected = getSelectedAccount();
        const path = getAuthFilePath(selected.email);
        authFile = existsSync(path) ? path : undefined;
        outputDir = `test-results/${selected.email}`;
    } catch {
        authFile = undefined;
    }
}

const use = {
    headless: process.env.HEADLESS !== 'false',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on',
    launchOptions: {
        slowMo: Number(process.env.SLOW_MO) || 0,
    },
};

export default defineConfig({
    testDir: './tests',
    outputDir,
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: [['html', { open: 'never' }], ['list']],

    timeout: 75_000,
    expect: {
        timeout: 5_000,
    },

    use,

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
        ...(process.env.PLATFORM === 'phone'
            ? [
                  {
                      name: 'web-phone',
                      testMatch: 'tests/web/*.spec.ts',
                      use: {
                          ...devices['Desktop Chrome'],
                          baseURL: BASE_URL,
                          storageState: authFile,
                          viewport: { width: 400, height: 800 },
                          isMobile: true,
                      },
                  },
              ]
            : []),
    ],
});
