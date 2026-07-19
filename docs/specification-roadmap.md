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

**Status: TODO**

Baseline established in Phase 1: `getNativeValidationMessage` (100% via the new dedicated test) and `Loader.jsx` (100%, trivial) are the only two files with real coverage today. Next priority candidates, per the original plan: `helpers/operations.js` (financial calculations) and `GlobalContext.jsx`'s reducer/state-transition logic — both genuine business-rule surfaces, not presentational JSX.

---

## Phase 3 — CI gate

**Status: DONE** (2026-07-19)

Added `.github/workflows/ci.yml`: checkout → `npm ci` → `npm run lint` → `npm run test:cov` → `npm run build`. Runs on every push to `main` and every PR targeting `main`. Verified `npm ci` installs cleanly from the current `package-lock.json` and every step passes locally. No coverage threshold set yet (deferred to Phase 2.5).

---

## Phase 4 — Executable specification layers

**Status: TODO**

1. **`docs/SPECIFICATION.md`** — generative design rules: component/folder conventions (`components/<Name>/<Name>.jsx` + co-located `.css`), hook conventions, the `services/` HTTP-client layer's contract with `module-api`'s `finan` module, `GlobalContext` conventions, `localStorage`/auth-token/`cyfer.js` usage.
2. **Playwright E2E** (`test/e2e/` or `e2e/`) — drives the real built app in a real browser against a real running `module-api` instance. Covers the golden paths: login, initial-load dashboard, full movement CRUD (`Form`, `Table`, `TabInput`), chart rendering (`LineChart`), currency selection.
3. **Post-deploy smoke check** — a small script confirming the deployed bundle actually loads and key routes render after `npm run up` ships it, the frontend analogue of the backend's `scripts/smoke-test.js`.

---

## Progress log

- **2026-07-19** — Phase 0 baseline audit completed at the user's request, extending the executable-specification approach already applied to `module-api` and `animecream-react` to this frontend. Roadmap drafted.
- **2026-07-19, same day** — Phases 0b, 1, and 3 executed in full: Vitest + Testing Library + Playwright installed (no fast-refresh/jsdom friction here, unlike `animecream-react`), the existing `npm run lint` run for the first time and brought from 35 to 0 problems (removing one genuinely dead file, `chartOptions.js` — see Phase 1's findings), two new test files written as the first real coverage (`nativeValidation.test.js`, `Loader.test.jsx`, 9/9 passing), and a CI workflow added. `npm run lint`, `npm run test:cov`, and `npm run build` all pass from the current working tree. Phase 2 (dead-code sweep) partially covered as a side effect; Phase 2.5 (coverage hardening) and Phase 4 (spec layers) remain open.
