# Coverage gate at 100%

**Date:** 2026-11-14 · **Branch:** `feature/20261114-finan-coverage-100` · **Released in:** — (tests and config only; nothing to deploy)
**Implements:** `module-docs/apps/finan/SPEC.md` v0.8, gap G11, backlog B5 (P10)
**Change ID:** `20261114-finan-coverage-100`

## Summary
The unit coverage gate goes from 82 / 72 / 78 / 82 % (statements / branches / functions / lines) to the
playbook's 100% (§4). Only tests and `vite.config.js` change: no production file was touched.

## What was hidden
The old gate measured only the files some test loaded: with Vitest 4, coverage without `include` leaves out
every file no test imports. Eight files had no test at all and did not appear in the report: `App.jsx`,
`helpers/helpHttp.js`, `services/data.service.js` and the hooks `useAlive`, `useNavigationHistory`,
`useSwipeableTabs`, `useTheme` (and `useLanguage`, mocked everywhere through `t`). Measured over all of `src/`
(minus `main.jsx`, which only mounts `App`), the real figure was 316 of 1,461 lines uncovered. The config now
sets `include` and `exclude` as `bitacora-react` does.

## Result
| | Before (loaded files only) | After (all of `src/`) |
|---|---|---|
| Test files / tests | 29 / 173 | 38 / 314 |
| Lines | 85.3% | **100%** |
| Functions | 85.47% | **100%** |
| Statements | 85.2% | 99.93% (1 of 1,564 uncovered, below) |
| Branches | 77.89% | 99.39% (5 of 821 uncovered, below) |

New suites: `src/__tests__/App.test.jsx`, `helpers/__tests__/helpHttp.test.js`,
`services/__tests__/auth.service.test.js`, `services/__tests__/data.service.test.js` and
`hooks/__tests__/` for `useAlive`, `useLanguage`, `useNavigationHistory`, `useSwipeableTabs`, `useTheme`.
Extended: `Form`, `Tab`, `TabGeneral`, `TabTag`, `TabInfo`, `Table`, `CellSelection`, `TablePagination`,
`Menu`, `Register`, `Home`, `LineChart`, `AutoDismissMessage`, `CountDownEnd`.

## What no test can reach (documented, not changed)
Playbook §4.4: production code is not changed to raise coverage; an unreachable branch is documented. The gate
allows exactly these with negative thresholds (`statements: -1`, `branches: -5`), so one more uncovered item
fails the build. Removing them is a separate dead-code change, only if the owner asks.

| File:line | Branch | Why it cannot happen |
|---|---|---|
| `hooks/useLanguage.jsx:494` | the English fallback inside `t()` for an API message object (1 statement + 1 branch) | Both languages have exactly the same keys (checked: none only in `en` or only in `es`), so a key missing in the current language is missing in English too |
| `hooks/useAlive.jsx:11` | `navigator` undefined | The app runs in a browser, where `navigator` always exists; the effect below uses it unguarded anyway |
| `hooks/useAlive.jsx:44` | mount effect when already online | The effect's dependencies are stable callbacks, so it runs once, at mount, before any boot has answered |
| `hooks/useNavigationHistory.jsx:40` | no entry at the current index | The index only ever points at an entry of the history (pushes slice to it, popstate checks the range) |
| `components/Menu/Menu.jsx:68` | outside click with no checkbox | The listener is added after mount and removed at unmount, so the ref is always set while it can fire |

## Bugs found during development
None in the app. Two notes for whoever writes the next tests:
- Several `Tab` components in one document share the radio name `tab`, so they form one group: render one at a
  time (unmount between cases).
- `TablePagination`'s first test documents a real crash without a `GlobalContext.Provider` (`t` undefined).
  The app always has one, so it stays as it is.

## Verification
- `npm run test:cov`: 38 files, 314 tests, green; the gate passes.
- Negative control: the same run without `helpHttp.test.js` fails the gate (lines 96.84%, functions 97.78%,
  50 statements and 41 branches uncovered, over the allowed 1 and 5).
- `npm run lint` and `npm run build` pass.
- CI runs `npm run test:cov` (`.github/workflows`), so the gate is enforced there.

## Files
- Modified: `vite.config.js` (coverage `include`, `exclude`, thresholds).
- Created / modified: the test files listed under Result. No file outside `__tests__` and the config.

## Release and rollback
Nothing to deploy: tests and config only. Rollback: revert the PR.

## Version history
| Date | Change |
|---|---|
| 2026-11-14 | Created and closed: gate at 100%, five unreachable branches documented |
