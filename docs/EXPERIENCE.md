# What this repo has learned

Lessons from building and running `finan-react`, gathered on 2026-11-05 from code comments, commit
messages (2023–2026) and `docs/specification-roadmap.md`. The global view of the app is in
`module-docs/apps/finan/SPEC.md`; this file keeps what only matters here.

Each lesson says what happened, why, and what to do. Add a lesson when a change teaches one.

## React and hooks

- **A dependency array runs on every render, before any guard in the effect.** `navigation.currentState`
  crashed `Tab.jsx` and `TablePagination.jsx` when `navigation` was undefined, although the effect's
  first line checked for it. Use optional chaining in the array too.
- **`navigation` is a new object each render.** Depend on its fields, not on it, or the effect runs
  every time. That is why the two `eslint-disable` lines in `TablePagination.jsx` exist.
- **`??` does not catch `NaN`.** `parseInt(undefined) ?? -1` is `NaN`, which is how `$NaN` reached the
  Information banner. Check with `Number.isFinite`.
- **`GlobalContext` defaults to `{}`.** A component outside the provider gets silent `undefined`s, not an
  error. Tests must wrap it in a provider that supplies what it reads.
- **Every tab stays mounted.** The tabs are CSS radios, so all screens render and run at once. A chart or
  effect in a hidden tab has no layout to measure.
- **`hiddenColumns` is compared with two arrays.** The header uses the `columns` labels when given, the
  cells always use raw keys. Pass both spellings, as `TabGeneral.jsx` does.

## Tables

- **Never skip a data sync because the array is empty.** Switching to a currency with no rows left the
  previous currency's rows on screen (2026-09-16).
- **Summary rows need a fixed order.** Sorting by first appearance flipped income and expense month to
  month. Use `SOURCE_TYPE_ORDER`.
- **Index selection by row identity, never by position.** Sorting, searching and paging move positions
  (`helpers/cellSelection.js`).

## Forms

- **Display and value are separate for money.** The field shows `1,234,567.89`, the state keeps
  `1234567.89` because `parseFloat` stops at a comma. Keep the cursor by counting everything except the
  commas, or it jumps back after a typed `.` (2026-08-06).
- **Bad credentials are not an offline server.** Login must not call `setInit(false)` on a rejected
  password, or the app shows the wrong state.

## Charts and dates

- **State can outlive its data.** After a currency switch the selected year may not exist, and the chart
  stays blank. Fall back to the newest year present (2026-07-23).
- **Read CSS variables after the theme applies.** `LineChart.jsx` resolves them in an effect, again after
  50 ms. A helper that read them once froze the colors at first paint.
- **`new Date('2023-03-01')` is UTC midnight.** In Colombia that is the previous day, so `monthDiff` gives
  12.03 instead of 12. Parse date-only strings as local.
- **Never add two approximations for a total.** The countdown's monthly total drifted around 24 because
  each side used a different month's length. Compute it once from the fixed dates (2026-09-17).

## PWA and deploys

- **Bump, build, upload, in that order.** `dist/sw.js` is copied at build time (`npm run bup`).
- **Navigation is network first; only hashed files are cache first.** Otherwise each deploy needs a second
  open. `docs/changes/20261104-pwa-page-network-first.md` has the full story.
- **Keep the app at install time.** Files fetched by pages land in the outgoing cache, which activation
  deletes.
- **A deleted asset must not blank the app.** A page cached before a deploy can point at files that no
  longer exist; recover instead of looping on reload (2026-07-12).
- **Case matters on Linux CI.** Imports that worked on Windows failed there (2026-11-04).
- **Viewport heights took a long time to settle.** Navbar `10svh`, tabs `9svh` and panel `81vh` add up to
  the screen. Do not put `min-height` or `max-height` on them (2024-12-27).

## Tests

- **E2E shares one real account, so run one worker.** Parallel specs timed out on delete; it was the test
  setup, not the app (`workers: 1`).
- **Date fixtures must be recent.** The table is newest first and paginated, so an old date is not on
  page 1 although the save worked.
- **Scope lookups to one table.** The same movement name appears in several tables.
- **`react-chartjs-2` is mocked in unit tests.** jsdom has no real canvas; only `chart-currency.spec.js`
  renders it.
- **Sync calls only the queues that have items.** An empty `update` queue makes no API call, which
  matters when instrumenting it.
- **`npm run smoke` needs no login.** It proves the page mounts, not that data loads.

## Open items

Known bugs and decisions are in `module-docs/apps/finan/SPEC.md` §Gaps, not here.

**Last verified against source:** 2026-11-05
