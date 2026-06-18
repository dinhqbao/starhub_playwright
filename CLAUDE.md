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
npm run test:web          # web tests (Chromium)
npm run test:app          # app tests (Android viewport)
npm run test:app:all      # app tests (Android + iOS viewports)
npm run test:headed       # run with visible browser
npm run test:debug        # step-by-step debugger
npm run test:ui           # Playwright UI mode
npm run report            # open last HTML report
npm run format            # format all files with Prettier
npm run select            # switch active test account
```

## Project structure

```
tests/
  web/              # Logged-in web tests + auth.setup.ts
  app/              # Logged-in app tests + auth.setup.ts (use /Torpedo/* paths)
  nonlogin/
    web/            # Non-login web tests
    app/            # Non-login app tests
  pages/            # Page Object Models (POM)
  utils/            # Shared helpers (auth)
playwright.config.ts
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

## Playwright projects

| Project | testMatch | Device | Notes |
|---------|-----------|--------|-------|
| `web-setup` | `**/web/*.setup.ts` | Desktop Chrome | Saves auth state for web |
| `app-setup` | `**/app/*.setup.ts` | Galaxy S24 | Saves auth state for app |
| `web-chromium` | `tests/web/*.spec.ts` | Desktop Chrome | Depends on `web-setup` |
| `app-android` | `tests/app/*.spec.ts` | Galaxy S24 | Depends on `app-setup` |
| `app-nonlogin` | `tests/nonlogin/app/*.spec.ts` | Galaxy S24 viewport | No auth dependency |
| `web-nonlogin` | `tests/nonlogin/web/*.spec.ts` | Desktop Chrome | No auth dependency |

## Auth flow

Auth state is stored in `.auth/<email>.json`. Both setup files follow the same pattern:

1. If auth file exists → load it and verify session is still valid
2. If valid → save refreshed tokens and exit
3. If expired or no file → fresh context (no old cookies) → login → save tokens

Run `npm run select` to switch which account is active before running tests.

## Writing tests

- Place tests in `tests/web/` or `tests/app/` depending on the target.
- Use `page.goto('/path')` — `baseURL` is injected per project; never use absolute URLs.
- Follow the Page Object Model: selectors and actions go in `tests/pages/`.
- Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors.
- Use `test.describe` to group related tests.
- Use `test.step` for readable traces — no `console.log` in passing tests.

### Test filter tips

```bash
npx playwright test tests/web/broadband.spec.ts   # by file (use forward slashes)
npx playwright test -g "buy broadband"             # by test name
npx playwright test --project=app-android          # by project
```

## Conventions

- One `*.spec.ts` per feature area (`broadband.spec.ts`, `bundle.spec.ts`, etc.).
- Page Objects in `tests/pages/<Name>.ts`, extending `SH_Page` base class.
- Shared fixtures in `tests/fixtures/index.ts`.
- Indentation: 4 spaces (enforced by `.prettierrc` + Prettier VS Code extension).
