# StarHub Playwright Test Project

## Overview

Playwright + TypeScript E2E test suite for StarHub's OutSystems platform.

| Target | URL |
|--------|-----|
| Web | `https://starhubltd-tst.outsystemsenterprise.com` |
| App | `https://starhubltd-tst.outsystemsenterprise.com/Torpedo` |

URLs are configured via `.env` — never hardcode them in test files.

## Setup

```bash
npm install
npx playwright install
cp .env.example .env   # then fill in values
npm run select         # pick the test account
```

## Commands

```bash
npm run test              # run all tests
npm run test:web          # all web tests (Chromium)
npm run test:app          # all app tests (Android viewport)
npm run test:web <file>   # run tests/web/<file>.spec.ts
npm run test:app <file>   # run tests/app/<file>.spec.ts
npm run test:web:noauth   # same as test:web but skip auth
npm run test:app:noauth   # same as test:app but skip auth
npm run test:app:all      # app tests (Android + iOS viewports)
npm run test:headed       # run with visible browser
npm run test:debug        # step-by-step debugger
npm run test:ui           # Playwright UI mode
npm run report            # open last HTML report
npm run format            # format all files with Prettier
npm run select            # switch active test account
```

### Targeting a specific file or test case

```bash
npm run test:web broadband              # tests/web/broadband.spec.ts
npm run test:app broadband postsale     # tests/app/broadband.spec.ts, grep "postsale"
npm run test:app:noauth device          # tests/app/device.spec.ts, no auth
npm run test:app:noauth device bau      # tests/app/device.spec.ts, grep "bau", no auth
```

`--noauth` skips loading `storageState` and bypasses `ensureSession` in the fixture — the browser starts completely unauthenticated.

## Project structure

```
tests/
  web/              # Web tests (auth or noauth)
  app/              # App tests (auth or noauth) — use /Torpedo/* paths
  pages/            # Page Object Models (POM)
  utils/            # Shared helpers (auth)
  fixtures/         # Shared test fixtures
playwright.config.ts
scripts/
  run-test.js       # CLI helper for test:web / test:app scripts
accounts.csv        # Test accounts — mark one row selected=true
.env                # Local env — never commit
.env.example        # Committed template
```

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Base URL for all tests | `https://starhubltd-tst.outsystemsenterprise.com` |
| `HEADLESS` | Run headless | `true` |
| `SLOW_MO` | Slow motion delay (ms) | `1000` |
| `DEFAULT_PASSWORD` | Fallback password for accounts.csv rows with no password | `Slice1234` |
| `NOAUTH` | Skip storageState and ensureSession when `true` | — |

## Playwright projects

| Project | testMatch | Device |
|---------|-----------|--------|
| `web-chromium` | `tests/web/*.spec.ts` | Desktop Chrome |
| `app-android` | `tests/app/*.spec.ts` | Galaxy S24 |

## Auth flow

Auth state is stored in `.auth/<email>.json`. The fixture checks session validity once per worker:

1. Load `storageState` from `.auth/<email>.json` (set in `playwright.config.ts`)
2. Navigate to a known page and verify the session is still active
3. If expired → re-login and save refreshed tokens
4. If `NOAUTH=true` → skip both storageState and session check entirely

Run `npm run select` to switch which account is active before running tests.

## Writing tests

- Place tests in `tests/web/` or `tests/app/` depending on the target.
- Use `page.goto('/path')` — `baseURL` is injected per project; never use absolute URLs.
- Follow the Page Object Model: selectors and actions go in `tests/pages/`.
- Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors.
- Use `test.describe` to group related tests.
- Use `test.step` for readable traces — no `console.log` in passing tests.

## Conventions

- One `*.spec.ts` per feature area (`broadband.spec.ts`, `bundle.spec.ts`, etc.).
- Page Objects in `tests/pages/<Name>.ts`, extending `SH_Page` base class.
- Shared fixtures in `tests/fixtures/index.ts`.
- Indentation: 4 spaces (enforced by `.prettierrc` + Prettier VS Code extension).
