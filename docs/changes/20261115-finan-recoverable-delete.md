# Deleted movements, kept 7 days on the device

**Date:** 2026-11-15 · **Branch:** `feature/20261115-finan-recoverable-delete` · **Released in:** https://finan.animecream.com, 2026-11-15 (PR #13, deployed with #14: `sw.js` 2.1.48)
**Implements:** `module-docs/apps/finan/SPEC.md` v0.9 — §2.2.1 (P11, P12), D2, acceptance H1–H9
**Change ID:** `20261115-finan-recoverable-delete` (finan-react only; no API or data change)

## Summary
A movement deleted from the server is kept on the device for 7 days. Input shows a **Deleted (N)** table under the
form, only when it has rows: name, value, type, date, tag and when it was deleted, newest first. **↺ Restore** sends
it again as a new movement; **🗑 Delete for good** asks first and removes it from the device. Removing an unsent row
from the Offline table stays final (P12).

## Decisions
- **Restore never sends `operate_for`.** Deleting never undid the linked adjustment (spec D4, G7, which the owner
  keeps), so sending the origin again would apply it twice. The restored movement gets a new id.
- **Kept only once the delete reached the server:** on a successful Delete, and when a queued delete syncs. A failed
  delete waits in the Offline queue as before and is not in Deleted.
- **A restore follows the Insert path:** online it calls `insert`; offline, busy, or refused by the API it goes to the
  Offline queue. It leaves Deleted at once in every case, so it is never in both lists.
- **Plain JSON under `deleted`**, like the Offline queue (`insert`, `update`, `del`); logout already clears every
  local key. No size cap: 7 days bounds it.

## Files
- `src/helpers/deletedMovements.js` (new): `readDeleted` (drops rows 7 days old, from storage too), `addDeleted`,
  `removeDeleted`, `toRestoreRequest`; `KEEP_MS`.
- `src/components/Form/Form.jsx`: the `deleted` state, kept on a successful delete and on a synced queued delete,
  `handleDeletedRestore`, `handleDeletedForGood`, the Deleted table.
- `src/components/Table/Table.jsx`: optional `onRowRestore` (a ↺ button next to edit and delete).
- `src/hooks/useLanguage.jsx`: `deletedTable`, `deletedOn`, `restore`, `deleteForGood`, `areYouSureForGood`, in
  English and Spanish.
- `public/sw.js`: 2.1.46 → 2.1.47, bumped in this PR so `main` matches what is deployed.
- `docs/SPECIFICATION.md` §7: the `deleted` key.
- Tests: `src/helpers/__tests__/deletedMovements.test.js` (new), `Form.test.jsx` (H1–H8 and the fallbacks);
  Playwright `test/e2e/deleted-movements.spec.js` (new); `test/e2e/dashboard.spec.js` adjusted (below).

## Bugs found during development
- **`dashboard.spec.js` failed after the change:** its last step checked that no row anywhere on the page held the
  deleted movement's name. Every tab stays mounted (spec §2.1), so the name is now in the Deleted table of Input.
  Not a bug in the app: the check is scoped to the General panel, and the test also checks that the movement is
  kept in Deleted.

## Verification
- `npm run test:cov`: 40 files, 351 tests, **100%** statements, branches, functions and lines.
- `npm run lint`, `npm run build`: pass.
- Playwright against the local module-api and the local Docker database (no real data; emails disabled): **8/8** —
  the 6 existing specs and 2 new ones: H1 (Deleted (1) under the form), H2 (restore → `insert`, back in General),
  H3 (the request has no `operate_for`), H5 (declined keeps the row; accepted removes it and calls no
  `/api/finan/` route), H9 (logout removes `deleted`). H4, H6, H7, H8 by the unit tests.

## Release and rollback
finan-react only: merge, then `npm run build && npm run up` from `main` (the `sw.js` bump is already in the PR);
confirm the served `sw.js` version (2.1.47), bundle name and `/version.json`. Rollback: revert the PR and deploy.
Rows already kept stay in `localStorage` harmlessly until logout.

## Post-deploy checklist
- On the phone: delete a test movement → it shows in Deleted (1) under the form; Restore → it is back in General.

## Version history
| Date | Change |
|---|---|
| 2026-11-15 | Created; unit 100% (351), Playwright 8/8 local |
| 2026-11-15 | **Merged** (PR #13, `b094d37`), then #14 on top (`2022fc3`). **Deployed** together from `main`: unit 352 at 100%, lint and build pass, `npm run up` "No error found". Served: `/version.json` commit `2022fc3`, `dirty: false`; `sw.js` 2.1.48 (not 2.1.47: #14 bumped once more); bundle `index-5e5d04fd.js`, which holds the Deleted table. The phone check of the post-deploy checklist is the owner's (it writes a movement in production) |
