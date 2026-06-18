# StarHub Playwright Tests

E2E test suite for StarHub's OutSystems platform — web and mobile app viewports.

| Target | URL                                                       |
| ------ | --------------------------------------------------------- |
| Web    | `https://starhubltd-tst.outsystemsenterprise.com`         |
| App    | `https://starhubltd-tst.outsystemsenterprise.com/Torpedo` |

---

## Setup

```bash
npm install
npx playwright install
cp .env.example .env   # fill in values
npm run select         # pick a test account
```

### Environment variables (`.env`)

| Variable           | Description                                      | Default                                           |
| ------------------ | ------------------------------------------------ | ------------------------------------------------- |
| `BASE_URL`         | Base URL for all tests                           | `https://starhubltd-tst.outsystemsenterprise.com` |
| `HEADLESS`         | Run headless (`true`/`false`)                    | `true`                                            |
| `SLOW_MO`          | Delay between actions in ms                      | `1000`                                            |
| `DEFAULT_PASSWORD` | Fallback password when not set in `accounts.csv` | `Slice1234`                                       |

---

## Test accounts

Accounts are stored in `accounts.csv`. Run `npm run select` to switch the active account. The selected account is used by both web and app auth setups.

---

## Running tests

### Run everything

```bash
npm run test
```

### Run by project

```bash
npm run test:web        # web tests (logged-in, Desktop Chrome)
npm run test:app        # app tests (logged-in, 320×700 viewport)
```

### Run a specific file

```bash
npx playwright test tests/web/broadband.spec.ts
npx playwright test tests/app/device.spec.ts
```

> Use forward slashes on all platforms.

### Run by test name

```bash
npx playwright test -g "buy broadband"
npx playwright test -g "preorder"
```

### Open interactive UI

```bash
npm run test:ui
```

---

## Logged-in vs non-login flows

Tests are split into two flows depending on whether they require an authenticated session.

### Logged-in flow

Files live in `tests/web/` or `tests/app/`. Auth is handled automatically before the tests run.

| Project        | Directory    | Device         |
| -------------- | ------------ | -------------- |
| `web-chromium` | `tests/web/` | Desktop Chrome |
| `app-android`  | `tests/app/` | Galaxy S24     |

```bash
# Run a logged-in web test
npx playwright test tests/web/broadband.spec.ts

# Run a logged-in app test
npx playwright test tests/app/device.spec.ts
```

Auth state is cached in `.auth/<email>.json`. If the session is still valid it is reused; if expired the setup logs in again automatically.

### Non-login flow

Files live in `tests/nonlogin/app/` or `tests/nonlogin/web/`. No setup step runs — the browser starts unauthenticated.

| Project        | Directory             | Device         |
| -------------- | --------------------- | -------------- |
| `app-nonlogin` | `tests/nonlogin/app/` | Galaxy S24     |
| `web-nonlogin` | `tests/nonlogin/web/` | Desktop Chrome |

```bash
# Run a non-login app test
npx playwright test tests/nonlogin/app/device.spec.ts

# Run a non-login web test
npx playwright test tests/nonlogin/web/device.spec.ts
```

> Do not place non-login tests inside `tests/app/` or `tests/web/` — those directories are wired to the auth setup projects.

---

## Shared test steps

When a feature needs both a logged-in and a non-login variant, the test logic lives in a shared `*.steps.ts` file. Both spec files import from it.

```
tests/app/device.steps.ts          ← shared steps
tests/app/device.spec.ts           ← logged-in spec (imports steps)
tests/nonlogin/app/device.spec.ts  ← non-login spec (imports same steps)
```

---

## Project structure

```
tests/
  web/              # Logged-in web tests + auth.setup.ts
  app/              # Logged-in app tests + auth.setup.ts
  nonlogin/
    web/            # Non-login web tests
    app/            # Non-login app tests
  pages/            # Page Object Models (extend SH_Page)
  utils/            # Shared helpers (auth)
playwright.config.ts
accounts.csv        # Test accounts
.env                # Local config — never commit
.env.example        # Template — commit this
```

---

## Useful commands

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `npm run test`        | Run all tests                  |
| `npm run test:web`    | Web logged-in tests only       |
| `npm run test:app`    | App logged-in tests only       |
| `npm run test:headed` | Run with visible browser       |
| `npm run test:debug`  | Step-by-step debugger          |
| `npm run test:ui`     | Playwright UI mode             |
| `npm run report`      | Open last HTML report          |
| `npm run select`      | Switch active test account     |
| `npm run format`      | Format all files with Prettier |

---

## Writing new tests

- **Logged-in test**: add `*.spec.ts` to `tests/web/` or `tests/app/`
- **Non-login test**: add `*.spec.ts` to `tests/nonlogin/web/` or `tests/nonlogin/app/`
- **Shared logic**: extract steps into `*.steps.ts` next to the logged-in spec, then import in both
- Use `page.goto('/path')` — never hardcode the full URL
- Selectors: prefer `getByRole`, `getByLabel`, `getByText` over CSS
- Page Objects go in `tests/pages/`, extending `SH_Page`
