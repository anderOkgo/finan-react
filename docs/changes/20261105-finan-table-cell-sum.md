# Select table cells and see their sum

**Date:** 2026-11-05 · **Branch:** `feature/20261105-finan-table-cell-sum` · **Released in:** https://finan.animecream.com, 2026-11-05 (deployed before the merge, reviewed by the owner)
**Implements:** no global spec for finan yet; screens in `module-docs/apps/finan/design/`
(`Selection.dc.html`, `README.md`)
**Change ID:** `20261105-finan-table-cell-sum`

## Summary
In any table, holding a money cell for half a second starts a selection, and each tap adds or removes
a cell. On a computer, Ctrl + click and Shift + click do the same. A bar above the tabs shows the count
and the total, with average, minimum and maximum on tap. Front end only.

## Decisions (owner, 2026-11-05)
- **Gastos subtract.** They are stored as positive numbers, so a row of type `expense` or the
  `expenses` column counts as negative, and the bar reads **Net**. Only gastos read as a plain **Sum**.
- Movements of type `balance` count as positive, like an ingreso.
- **When the data changes, the selection stays** and its total follows the new values; a deleted row
  leaves it.
- **A cell hidden by the search still counts**, and the bar says how many are hidden.

## Technical decisions
- Cells are keyed by row identity (`id`, or the non-money values in summary tables), never by position,
  so sorting, searching and paging keep the selection.
- Totals add in cents to avoid decimal errors.
- One selection at a time in the app: every table's bar sits in the same place.
- While selecting, double click does not open a row, and a slide over the table does not change tab.
- On a phone a long press cannot select text or open the context menu; a right click keeps its menu.

## Files created / modified
- `src/helpers/cellSelection.js` — new, the rules
- `src/components/Table/useCellSelection.js`, `SelectionBar.jsx`, `SelectionBar.css` — new
- `src/components/Table/Table.jsx`, `Table.css` — selectable money cells
- `src/hooks/useSwipeableTabs.jsx` — ignores slides while selecting
- `src/hooks/useLanguage.jsx` — new labels in English and Spanish

## Known limits
- Selecting needs a pointer: there is no keyboard path to a cell.
- Ctrl + click and Shift + click are covered by unit tests only, not by a desktop browser run.

## Verification
- Unit: 170 passed. Lint and build pass.
- E2E, local API and test users: 5 of 5. The first run failed 4 of 5 because the local API was not up.
- `module-api`, no changes: not run again for this change; 1470 passed earlier the same day.
- Touch: the real app with a mocked API on an emulated Pixel 7: long press, taps, net, details and clear;
  no text selected, no tab change on a slide over the table.
- Production: `npm run smoke` 5 of 5, and the served bundle holds the new code.

## Release and rollback
Front end only: `npm run bup`, then commit with the `public/sw.js` version it bumps. Rollback: revert
and deploy.

## Version history
| Date | Change |
|---|---|
| 2026-11-05 | Created |
