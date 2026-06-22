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

### Run all tests for a platform

```bash
npm run test:web        # all web tests (Desktop Chrome, with auth)
npm run test:app        # all app tests (Galaxy S24, with auth)
```

### Run a specific file

```bash
npm run test:web broadband      # → tests/web/broadband.spec.ts
npm run test:app device         # → tests/app/device.spec.ts
```

### Run a specific test case

```bash
npm run test:web broadband postsale     # grep "postsale" in broadband.spec.ts
npm run test:app device bau             # grep "bau" in device.spec.ts
```

### Run without auth (no storageState, no session check)

```bash
npm run test:app:noauth device          # tests/app/device.spec.ts, unauthenticated
npm run test:web:noauth broadband       # tests/web/broadband.spec.ts, unauthenticated
npm run test:app:noauth device bau      # + grep "bau"
```

### Other options

```bash
npm run test:app:all    # app tests on Android + iOS viewports
npm run test:ui         # Playwright interactive UI
npm run test:headed     # run with visible browser
npm run test:debug      # step-by-step debugger
```

---

## Auth flow

Auth state is cached in `.auth/<email>.json`. The fixture checks once per worker:

1. Load storageState from `.auth/<email>.json`
2. Navigate to a known page and verify the session is active
3. If expired → re-login and save refreshed tokens

Use `--noauth` scripts to bypass both storageState and the session check entirely — the browser starts unauthenticated.

---

## Project structure

```
tests/
  web/              # Web tests (auth or noauth)
  app/              # App tests (auth or noauth) — use /Torpedo/* paths
  pages/            # Page Object Models (extend SH_Page)
  utils/            # Shared helpers (auth)
  fixtures/         # Shared test fixtures
scripts/
  run-test.js       # CLI helper for test:web / test:app scripts
playwright.config.ts
accounts.csv        # Test accounts
.env                # Local config — never commit
.env.example        # Template — commit this
```

---

## Useful commands

| Command                          | Description                         |
| -------------------------------- | ----------------------------------- |
| `npm run test`                   | Run all tests                       |
| `npm run test:web`               | All web tests                       |
| `npm run test:app`               | All app tests                       |
| `npm run test:web <file>`        | Specific web file                   |
| `npm run test:app <file>`        | Specific app file                   |
| `npm run test:web <file> <grep>` | Specific web file + test name grep  |
| `npm run test:app <file> <grep>` | Specific app file + test name grep  |
| `npm run test:web:noauth`        | Web tests without auth              |
| `npm run test:app:noauth`        | App tests without auth              |
| `npm run test:headed`            | Run with visible browser            |
| `npm run test:debug`             | Step-by-step debugger               |
| `npm run test:ui`                | Playwright UI mode                  |
| `npm run report`                 | Open last HTML report               |
| `npm run select`                 | Switch active test account          |
| `npm run format`                 | Format all files with Prettier      |

---

## Writing new tests

- Add `*.spec.ts` to `tests/web/` or `tests/app/` depending on the target
- Use `page.goto('/path')` — never hardcode the full URL
- Selectors: prefer `getByRole`, `getByLabel`, `getByText` over CSS
- Page Objects go in `tests/pages/`, extending `SH_Page`
- Import `webTest` or `appTest` from `tests/fixtures/index.ts` as `test`
- Tests that need to run unauthenticated use the same files — just run with `test:web:noauth` or `test:app:noauth`
