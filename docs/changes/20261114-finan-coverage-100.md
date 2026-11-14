# Coverage gate at 100%

**Date:** 2026-11-14 · **Branch:** `feature/20261114-finan-coverage-100` · **Released in:** https://finan.animecream.com after merge (`npm run bup`)
**Implements:** `module-docs/apps/finan/SPEC.md` v0.8, gap G11, backlog B5 (P10)
**Change ID:** `20261114-finan-coverage-100`

## Summary
The unit coverage gate goes from 82 / 72 / 78 / 82 % (statements / branches / functions / lines) to the
playbook's 100% on all four, measured over every file of `src/`. Most of the change is tests. Five small
production edits remove branches no test could reach; the owner asked for them (2026-11-14), on the condition
that behavior stays the same.

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
| Test files / tests | 29 / 173 | 38 / 316 |
| Statements | 85.2% | **100%** (1,555 / 1,555) |
| Branches | 77.89% | **100%** (811 / 811) |
| Functions | 85.47% | **100%** |
| Lines | 85.3% | **100%** |

New suites: `src/__tests__/App.test.jsx`, `helpers/__tests__/helpHttp.test.js`,
`services/__tests__/auth.service.test.js`, `services/__tests__/data.service.test.js` and
`hooks/__tests__/` for `useAlive`, `useLanguage`, `useNavigationHistory`, `useSwipeableTabs`, `useTheme`.
Extended: `Form`, `Tab`, `TabGeneral`, `TabTag`, `TabInfo`, `Table`, `CellSelection`, `TablePagination`,
`Menu`, `Register`, `Home`, `LineChart`, `AutoDismissMessage`, `CountDownEnd`.

## Production edits: unreachable branches removed, behavior unchanged
Playbook §4.4 keeps dead-code cleanup as a change the owner asks for; the owner asked for it in this one. Each
branch below could not run, so removing it changes nothing a user can see.

| File | Before | After | Why it is the same |
|---|---|---|---|
| `hooks/useLanguage.jsx`, `t()` for an API message object | current language, else English, else the key | current language, else the key | Both languages have the same keys and none is empty, so "missing here" always meant "missing in English too". A new test (`translations`) fails if the two drift apart. `translations` is now exported for that test (additive) |
| `hooks/useAlive.jsx`, initial online state | `typeof navigator !== 'undefined' ? navigator.onLine : true` | `navigator.onLine` | The app runs only in a browser; the effect in the same hook already read `navigator` unguarded |
| `hooks/useAlive.jsx`, mount effect | `if (!isOnlineRef.current) boot(true)` | `boot(true)` | The effect's dependencies are stable, and there is no `StrictMode` (`main.jsx`), so it runs once, at mount, when the ref is always `false` |
| `hooks/useNavigationHistory.jsx`, `pushHistory` | `if (currentState) { …compare… }` | compare directly | The index only ever points at an entry: pushes cut the history at it, popstate keeps it in range |
| `components/Menu/Menu.jsx`, outside click | `useEffect` + `if (checkboxRef.current)` | `useLayoutEffect` + direct access | With a layout effect React removes the listener during the unmount commit, before it detaches the ref, so the ref is always set when the listener runs. Adding the listener a frame earlier changes nothing for the user. A new test clicks after unmount |

## Bugs found during development
None in the app. Two notes for whoever writes the next tests:
- Several `Tab` components in one document share the radio name `tab`, so they form one group: render one at a
  time (unmount between cases).
- `TablePagination`'s first test documents a real crash without a `GlobalContext.Provider` (`t` undefined).
  The app always has one, so it stays as it is.

## Verification
- `npm run test:cov`: 38 files, 316 tests, green; 100% statements, branches, functions and lines; the gate is
  100 on all four.
- Negative control (with the earlier gate): the run without `helpHttp.test.js` fails it (lines 96.84%, functions
  97.78%, 50 statements and 41 branches uncovered).
- `npm run lint` and `npm run build` pass. CI runs `npm run test:cov`.
- Not run: the Playwright E2E. It needs `module-api` running locally against a real database and writes and
  deletes movements with the real account; aiming it at that data needs the owner's go-ahead. The five
  production edits are covered by unit tests of the same behavior.

## Files
- Modified (production): `src/hooks/useLanguage.jsx`, `src/hooks/useAlive.jsx`,
  `src/hooks/useNavigationHistory.jsx`, `src/components/Menu/Menu.jsx`.
- Modified (config): `vite.config.js` (coverage `include`, `exclude`, thresholds 100).
- Created / modified: the test files listed under Result.

## Release and rollback
`npm run bup` after the merge (front only; no API or data change). Rollback: revert the PR and deploy.

## Version history
| Date | Change |
|---|---|
| 2026-11-14 | Created: gate at 100% with five unreachable branches documented |
| 2026-11-14 | At the owner's request, the five branches removed with behavior unchanged; gate at 100 on all four |
