# Executable Specification Roadmap

## Goal

Turn this codebase into a base solid enough to produce an **executable specification**: documentation precise enough that an AI (or a new developer) could regenerate this frontend from scratch, using an automated test suite (unit/component, and browser-driven E2E) as the acceptance criteria the regenerated app must pass.

This roadmap mirrors the one already executed for the backend (`module-api/docs/specification-roadmap.md`) and the sibling frontend (`animecream-react/docs/specification-roadmap.md`), adapted for a codebase that has **no test tooling installed at all today** — Phase 0 here starts one step earlier than the backend's did: choosing and installing a stack, not triaging failures in an existing one.

## Cross-repo context

This app is a pure HTTP client of `module-api`'s API (see that repo's `docs/architecture.md` / `docs/SPECIFICATION.md` for the wire contract it consumes, specifically the `finan` module). It owns no server-side logic, no database, no SQL — so several backend-roadmap phases (cross-repo SQL hardening, schema-drift sweeps, transaction handling) simply don't apply here. What this app *does* own and needs its own acceptance criteria for: component rendering/interaction logic, hooks, the `services/` HTTP layer, `GlobalContext` state, chart rendering (`Charts/LineChart.jsx` via `react-chartjs-2`), client-side validation (`helpers/nativeValidation.js`), and the encrypt/decrypt helper (`helpers/cyfer.js` — same helper as `animecream-react`'s, worth flagging as a possible future shared-package extraction, out of scope here).

## Status legend

`TODO` not started · `IN PROGRESS` · `DONE` · `BLOCKED` (needs a decision)

---

## Phase 0 — Baseline audit

**Status: DONE** (2026-07-19)

- **No test runner is installed.** `package.json` has no `test` script and no `jest`/`vitest`/`@testing-library/*` in `devDependencies` — only `react`, `react-dom`, `react-router-dom`, `chart.js`, `react-chartjs-2`, `@fontsource/roboto` as runtime deps, and `vite`/`@vitejs/plugin-react`/`eslint*` as dev deps. Unlike `animecream-react`, there is no orphaned test file at all — a clean slate, not a rotted one.
- **ESLint is already wired** — `.eslintrc.cjs` exists (`eslint:recommended`, `plugin:react/recommended`, `plugin:react-hooks/recommended`) and `package.json` has a working `lint` script (`eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0`). This is ahead of `animecream-react`, which has the same dependencies installed but no config or script.
- **No CI** — `.github/workflows` absent, nothing gates `main` on anything, including the `lint` script that already exists and works.
- Inventory: 31 component files (`src/components/**/*.jsx`), 5 hooks (`src/hooks`), 4 helpers (`src/helpers`), 3 services (`src/services`), plus `src/contexts/GlobalContext.jsx`.
- Two untracked-looking scratch files at the repo root (`.scratch-nofb`, `.scratch-urlenc`) — not investigated as part of this audit; flagged only in case they're leftover debugging artifacts worth a separate cleanup pass.
- Build itself works (`npm run build` via `vite build`) — this is not a broken app, just an untested one.

---

## Phase 0b — Choose and install the testing stack

**Status: DONE** (2026-07-19)

Decision: **Vitest**, not Jest — same reasoning as `animecream-react`'s Phase 0b, kept consistent across both frontends since they share the same build tooling. Installed `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@playwright/test`. Added a `test` block to `vite.config.js` (`environment: 'jsdom'`, `globals: true`, `setupFiles: ['./test/setup.js']`, v8 coverage), `test/setup.js`, and `test`/`test:watch`/`test:cov`/`test:e2e` scripts (`lint` already existed).

This repo uses `@vitejs/plugin-react` (Babel-based), not the SWC variant `animecream-react` uses — the fast-refresh/jsdom incompatibility that had to be worked around there **did not occur here**, tests ran cleanly against the existing `vite.config.js` plugin setup with no changes needed to it.

The anticipated `chart.js`-canvas friction point didn't come up in this pass since the first tests written (Phase 1) targeted a helper and a presentational component, not `LineChart` directly — still a real consideration whenever `LineChart.jsx` itself gets a test.

---

## Phase 1 — First green baseline

**Status: DONE** (2026-07-19)

Ran the already-existing `npm run lint` for the first time in CI-worthy conditions: **35 problems**. Fixed all of them — see "Findings from the first lint pass" below. Wrote the first real tests to prove the harness works end to end, per the plan: `src/helpers/__tests__/nativeValidation.test.js` (9 cases covering every branch of `getNativeValidationMessage`'s HTML5-constraint-to-message mapping — chosen over a `GlobalContext`-exercising component test because it's pure business-rule logic, exactly the kind of untested branch Phase 2.5 flags as a real risk) and `src/components/Loader/__tests__/Loader.test.jsx` (presentational-component smoke test). **9/9 tests passing.**

Confirmed: `npm run test`, `npm run lint`, `npm run build` all pass from the current working tree.

### Findings from the first lint pass (real bugs and dead code, not just style)

- **`chartOptions.js` was fully dead code, not just unused-by-oversight** — its `getCSSVar` helper and exported `options` object were both zero-reference (the only import site was commented out in `LineChart.jsx`: `//import { options } from './chartOptions';`). Investigating further showed `LineChart.jsx` already reimplements the same idea itself and better: a local `getVar`/`resolveColors` effect that re-resolves CSS custom properties on theme change (`chartOptions.js`'s version had no such re-resolution, it would have frozen colors at first paint) and an inline `useMemo`'d `options` object. This is a clean supersession, not a missing-wiring gap — deleted the file entirely (Phase-2-style dead-code removal, done inline since ESLint surfaced it directly), plus the stale commented-out import line and a now-unused whole-file `eslint-disable` comment in `LineChart.jsx`.
- **`Tab.jsx` had a fetched-and-stored value (`currentMonthExpenses`) that's never displayed** — `monthlyBudget` and `remainingBudget` (both derived from the same API response) are passed to child components, but the raw `currentMonthExpenses` figure isn't. Kept the state (still written by `setCurrentMonthExpenses`), renamed to `_currentMonthExpenses` to flag it as a possible missing-wiring gap rather than guessing where it should be displayed — same class of finding, and same "flag, don't guess" handling, as `animecream-react`'s `Tab.jsx`/`handleTop100Click` case.
- **`useAlive.jsx`'s `online` state has the identical never-exposed pattern found in `animecream-react`'s `useAlive.js`** — `setOnline` is called throughout the online/offline/visibility handling but the hook never returns `online` to any consumer. Same fix: kept, renamed `_online`.
- **`orphaned eslint-disable` directives removed** (both were stale, no longer matching the rule they claimed to suppress): a whole-file `react-refresh/only-export-components` disable in `LineChart.jsx` (removed along with the dead `chartOptions.js` import cleanup above) and a `react-hooks/exhaustive-deps` disable in `useLanguage.jsx` around the system-default-language sync effect.
- **`TablePagination.jsx` had the same two `navigation`-object-identity `exhaustive-deps` warnings as `animecream-react`'s copy of the same component** — `navigation` itself excluded from both effects' dependency arrays (a new object identity every render would cause the effect to re-run every render), only `navigation.pushHistory`/`navigation.currentState` are the real tracked dependencies. Scoped `eslint-disable-next-line` with rationale, not a blind dependency-array edit, for the same reason as `animecream-react`'s Phase 1: verifying each effect is safe to widen requires per-effect tracing that's out of scope for a lint-wiring pass.

Unlike `animecream-react`, this repo had **zero** `react/prop-types` findings (only 1 file, `TablePagination.jsx`, uses PropTypes at all, via `LineChart.jsx`/`TablePagination.jsx`'s own `.propTypes = {...}` static assignments — `plugin:react/recommended`'s `prop-types` rule apparently found nothing to flag), so no project-wide rule override was needed here, unlike `animecream-react`'s `.eslintrc.cjs`.

---

## Phase 2 — Dead code sweep

**Status: IN PROGRESS** — `chartOptions.js` (see Phase 1 findings) was found and removed as a side effect of wiring the linter. A systematic basename-grep sweep across all of `src/`, the way the backend's Phase 2 and `animecream-react`'s Phase 2 do it, hasn't been run yet.

---

## Phase 2.5 — Coverage hardening

**Status: IN PROGRESS** (2026-07-19)

`src/helpers/` now at **97.89% statements / 100% branches** — added dedicated test suites for `operations.js` (`moneyFormat`, `tableMoneyFormat`, `monthDiff`, `formattedDate`, `generateUniqueId`) and `cyfer.js` (same helper, same test suite, as `animecream-react`'s — see that repo's roadmap for the design notes on why each test creates a fresh `cyfer()` instance per `cy`/`dcy` call).

**Correction to the original plan:** `GlobalContext.jsx` turned out to be a 3-line `createContext({})` call with no reducer or state-transition logic of its own — the original Phase 2.5 plan assumed reducer logic that doesn't actually exist here (the real state lives in whichever component provides the context value, not in this file). Skipped as not applicable; no test written for a file with nothing to test.

**Real bug found while writing `monthDiff`'s tests, not fixed here:** `monthDiff('2023-03-01', '2024-03-01')` (ISO date-only strings) returned `12.0345...` instead of exactly `12` when run in a non-UTC timezone (reproduced in `America/Bogota`, UTC-5). Root cause: `new Date('2023-03-01')` parses as UTC midnight, which in a UTC-negative zone is still the *previous* day locally — so `monthDiff`'s `d1.getMonth()`/`d1.getDate()` (which read local time) see February 28 instead of March 1, corrupting the whole-month count and the fractional remainder. This means **`monthDiff`'s result is environment-dependent** for any caller passing ISO date-only strings (as opposed to `Date` objects or full ISO datetime strings) — a real portability bug, not a test artifact. Not fixed here (fixing it changes the return value for every existing string-based caller, needs its own verification pass against real usage, e.g. `Form.jsx`/`countDownEnd`). Worked around in the test suite itself by constructing `Date` objects via the local-time `new Date(year, month, day)` form instead of ISO strings, which sidesteps the bug and keeps the tests deterministic across timezones — but the underlying function still has the gap for real callers.

**Component testing started** (same day, second pass): `TablePagination.jsx` (9 tests) and `currencySelector.jsx` (3 tests). Aggregate now **85.11% statements / 79.51% branches** across the files touched so far.

**Same crash bug as `animecream-react`'s `TablePagination.jsx`, found and fixed here too:** this component reads `t`/`navigation` from `GlobalContext` via `useContext` rather than as props, but the underlying issue is identical — both `useEffect` dependency arrays read `navigation.pushHistory`/`navigation.currentState` unconditionally, and dependency arrays are evaluated every render regardless of the `if (!navigation) return` guard inside the effect body. Any render where the context doesn't supply `navigation` (reachable in principle — `navigation` isn't required by anything enforcing it's present, only convention) threw and unmounted the component. Fixed with the same optional-chaining fix. The real app's single top-level `GlobalContext.Provider` in `App.jsx` always supplies `navigation`, so this wasn't observed in production, but the test written before the fix reproduces it directly.

**`Form.jsx` covered** (same day, third pass) — 11 tests against the main movement-entry form, using a stateful `FormHarness` test wrapper (Form is a fully controlled component; a real parent-state harness was needed to exercise typing, reset, and edit-mode toggling faithfully rather than just checking static markup). Covers: input sanitization, online insert/update success and error paths, offline/busy queuing (`localStorage`), edit-mode delete with confirmation, reset, and the offline-queue-loaded-on-mount effect. `Form.jsx` now at 56.83% statements (up from 0%) — the remaining gap is mostly `handleRowDoubleClick`/`handleBulkData` (the offline-queue sync flow, not yet tested) and JSX branches for fields not exercised by every test.

**Real bug found while writing the emoji-input test, not fixed here:** `handleChangeInput`'s intended behavior (per the presence of a `sanitizedValue = value.replace(emojiRegex, '')` line) is to strip emoji characters from `movement_name`/`movement_tag` while keeping the rest of the typed text. But the emoji check that precedes it is `if (emojiRegex.test(value)) { message(...); return; }` — an early return that fires whenever the value contains *any* emoji, before the stripping line is ever reached. The result: the stripping line is dead code, and in practice a keystroke that introduces an emoji anywhere in the field is rejected outright (the field doesn't update at all) rather than having just the emoji removed. Not fixed here — it's ambiguous whether "reject the whole keystroke" or "strip just the emoji" is the actually-intended UX, and that's a product call, not an engineering one. The test asserts the current (reject) behavior explicitly, with the dead-code observation documented inline.

Remaining candidates for a future pass: `nativeValidation.js`'s two uncovered lines (94.11% today — `onNativeInvalid`/`onNativeInput`, the DOM-event wrapper functions around the already-fully-tested `getNativeValidationMessage`), `Form.jsx`'s offline-sync flow (`handleRowDoubleClick`/`handleBulkData`), and the rest of the component tree (all still at 0%).

---

## Phase 3 — CI gate

**Status: DONE** (2026-07-19)

Added `.github/workflows/ci.yml`: checkout → `npm ci` → `npm run lint` → `npm run test:cov` → `npm run build`. Runs on every push to `main` and every PR targeting `main`. Verified `npm ci` installs cleanly from the current `package-lock.json` and every step passes locally. No coverage threshold set yet (deferred to Phase 2.5).

---

## Phase 4 — Executable specification layers

**Status: IN PROGRESS** (2026-07-19)

### Playwright E2E — started, real backend, real browser, real results

`test/e2e/` now exists and was run for real against a live stack: `module-api` built and running locally (`node dist/index.js`, port 3001) against the real, already-running `animecream-mariadb` Docker container (shared setup work done once, alongside `animecream-react`'s Phase 4 — see that repo's roadmap for the Docker-start details).

**Enabling infrastructure, mirrored from `animecream-react`'s identical need:**
- **`src/helpers/apiConfig.js`** (new) — same fix as `animecream-react`: `set.json`'s `base_url` was hardcoded to production with no override. Added `API_BASE_URL = import.meta.env.VITE_API_BASE_URL || set.base_url`, switched `auth.service.js`/`data.service.js` (the only 2 files reading `set.base_url` directly here, fewer than `animecream-react`'s 6) to import from it.
- **`playwright.config.js`** — `webServer` auto-starts Vite on port 5181 (not 5180 — kept distinct from `animecream-react`'s in case both dev servers ever run at once) with `VITE_API_BASE_URL=http://localhost:3001/`.
- **`.env.e2e.local`** (gitignored) / **`.env.e2e.local.example`** (committed) — same `--env-file-if-exists` pattern as `animecream-react`. Reuses the *same* real account (`module-api`'s auth is centralized across modules, not per-frontend), confirmed working against this app's login too.
- **`vite.config.js`** — same `test.exclude: ['test/e2e/**']` fix, for the same reason (Vitest's default glob also matches Playwright's `*.spec.js` convention).

**Golden paths covered** (2 spec files, 4 tests, all passing against the real stack, and together):
- `auth.spec.js` — this app has **no public/unauthenticated view** (`Home.jsx` renders the login form directly whenever `username` is unset, unlike `animecream-react`'s browsable public catalog), so login is the one golden path everything else sits behind. Covers: the login form renders when logged out, and a real login with a real account reaches the dashboard (`Tab`).
- `dashboard.spec.js` — full movement CRUD via the real UI: logs in, fills and submits the real `Form` (Input tab), switches to the General tab and confirms the new movement is listed, double-clicks it to edit (pre-fills the form, matching `TabGeneral.jsx`'s `handleRowDoubleClick`), updates its value, confirms the update landed, then deletes it via the real Delete button (only rendered in edit mode) and confirms it's gone. Unlike `animecream-react`'s `admin.spec.js`, no API-bypass cleanup is needed for the success path — `Form.jsx` has a real delete button, so the whole lifecycle including deletion happens through the UI. A `afterEach` safety net still exists (real hard-delete via `DELETE /api/finan/delete/:id`, since finan movements are truly removed, not soft-deleted like series) in case a failed run leaves a movement behind in this real, shared account's real financial data.

**Real friction hit and fixed while writing `dashboard.spec.js`:** the first version used a fixed, arbitrary movement date (`2024-01-15`). The real movement table is sorted newest-first with only 20 rows per page against **1483 real records** — an old date buried the fixture past page 1, so every row-lookup timed out even though the movement had been created successfully (confirmed via a direct API check). Fixed by dating the fixture "now" instead. A second issue: a distinctively-named movement gets its own row in *two* of `TabGeneral`'s three tables (Movement Table and the per-name Name Summary table), so a bare `page.locator('tr', { hasText: ... })` hit Playwright's strict-mode "multiple elements" error — scoped every lookup to `.first()` (the Movement Table, which renders first).

Not yet covered: chart rendering (`LineChart`, `TabBalance`) and currency selection — both read-only/display concerns, lower risk than the CRUD path just covered.

**`docs/SPECIFICATION.md` written** (same day, alongside `animecream-react`'s) — generative design rules extracted from the real code: component/folder conventions, the `GlobalContext`-pervasive state model (the opposite default from `animecream-react`'s prop-drilling — see that repo's own spec §2 for the contrast), `.jsx`-extension hook conventions, the `services/`+`apiConfig.js` contract, the `react-router-dom`-installed-but-unused finding (§6), `localStorage` key inventory (the offline mutation queue — `insert`/`update`/`del` — has no `animecream-react` equivalent), and testing conventions.

### Still open

1. **Chart + currency-selection E2E** (see above).
2. **Post-deploy smoke check** — a small script confirming the deployed bundle actually loads and key routes render after `npm run up` ships it, the frontend analogue of the backend's `scripts/smoke-test.js`.

---

## Progress log

- **2026-07-19** — Phase 0 baseline audit completed at the user's request, extending the executable-specification approach already applied to `module-api` and `animecream-react` to this frontend. Roadmap drafted.
- **2026-07-19, same day** — Phases 0b, 1, and 3 executed in full: Vitest + Testing Library + Playwright installed (no fast-refresh/jsdom friction here, unlike `animecream-react`), the existing `npm run lint` run for the first time and brought from 35 to 0 problems (removing one genuinely dead file, `chartOptions.js` — see Phase 1's findings), two new test files written as the first real coverage (`nativeValidation.test.js`, `Loader.test.jsx`, 9/9 passing), and a CI workflow added. `npm run lint`, `npm run test:cov`, and `npm run build` all pass from the current working tree. Committed and pushed (`2d4e2f8`).
- **2026-07-19, later same day** — Phase 2.5 started: added `operations.test.js` and `cyfer.test.js`, bringing `src/helpers/` to 97.89% statements / 100% branches (25/25 tests passing). Corrected the original plan's assumption that `GlobalContext.jsx` had reducer logic to test (it doesn't — 3-line `createContext` call, nothing there). Found a real, environment-dependent bug in `monthDiff` (timezone-dependent result for ISO date-only string arguments) while writing its tests — documented in Phase 2.5, not fixed (needs its own scoped pass against real callers).
- **2026-07-19, later still** — Phase 2.5 continued: `TablePagination.jsx` and `currencySelector.jsx` covered (37/37 tests). Found and fixed the same crash bug as `animecream-react`'s `TablePagination.jsx` (optional `navigation`, here sourced from `GlobalContext`, dereferenced unconditionally in `useEffect` dependency arrays). Committed and pushed (`0af3851`).
- **2026-07-19, later still** — `Form.jsx` (the main movement-entry form) covered: 11 tests via a stateful test harness, 0% → 56.8% statements. Found (not fixed) a dead-code bug in `handleChangeInput`'s emoji handling — documented as a product-call, not an engineering one. Committed and pushed (`224da75`).
- **2026-07-19, later still** — Phase 4 started at the user's explicit request: `src/helpers/apiConfig.js` added (env-var override for the previously-hardcoded-to-production API base URL), and a Playwright E2E spec (`auth.spec.js`, 2 tests) written and run for real against the live local `module-api` + Docker DB stack shared with `animecream-react`'s Phase 4 work — both passing. Dashboard/movement-CRUD/chart E2E and `docs/SPECIFICATION.md` remain open.
- **2026-07-19, later still** — `dashboard.spec.js` added: full movement CRUD (create, edit, delete) through the real dashboard UI against the real account's real financial data (1483 existing records). Two real fixes needed along the way: an old fixture date buried the row past the newest-first table's first page, and a distinctively-named movement matched two different tables' rows (scoped lookups to `.first()`). All 4 E2E tests across both spec files pass together; `npm run test`/`lint`/`build` all still pass (48/48 unit tests). Confirmed via a direct API check that no `__E2E_TEST_MOVEMENT_*` rows were left behind.
- **2026-07-19, later still** — `docs/SPECIFICATION.md` written, cross-referencing `animecream-react`'s own spec wherever the two apps genuinely diverge (state model is the biggest one: `GlobalContext` here vs. prop-drilling there).
