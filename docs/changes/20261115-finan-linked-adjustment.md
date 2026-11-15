# A restore sends the origin again (the linked adjustment follows deletes and edits)

**Date:** 2026-11-15 · **Branch:** `feature/20261115-finan-linked-adjustment` · **Released in:** not yet
**Implements:** `module-docs/apps/finan/SPEC.md` v0.10 — L.5 (front), J11, J12; §2.2.1 restore
**Change ID:** `20261115-finan-linked-adjustment` (the same in `module-api`, which re-adjusts on delete and edit)

## Summary
With module-api v0.10 a delete gives the movement's effect back to its origin balance. So the Deleted copy now
keeps the origin (`operate_for`), and **Restore sends it**: the effect comes back. When the API answers "Linked
movement not found" (that balance was deleted meanwhile), the front sends the same movement again without origin
and shows "Restored without its origin: that balance no longer exists" (P14). Copies kept before this release have
no origin; their delete undid nothing, so they are restored without one, which is right.

Edits need no front change: the edit form already sends the origin it loaded from the row (`operate_for: row.log`),
and the API now re-adjusts.

## Files
- `src/helpers/deletedMovements.js`: `addDeleted` keeps a valid `operate_for`; `toRestoreRequest(row, { withoutOrigin })`;
  `LINKED_NOT_FOUND`.
- `src/components/Form/Form.jsx`: the restore retries without origin on "Linked movement not found" and says so; a
  row with no origin is not retried.
- `src/hooks/useLanguage.jsx`: `restoredWithoutOrigin` in English and Spanish ("Linked movement not found" already
  had its translations).
- `public/sw.js`: 2.1.48 → 2.1.49.
- `docs/SPECIFICATION.md` §7: the `deleted` key keeps the origin.
- Tests: `deletedMovements.test.js` (the origin kept, a missing one not, the request with and without it, an old
  row), `Form.test.jsx` (H1 keeps the origin; J11; J12; no retry without origin); Playwright
  `deleted-movements.spec.js` J11 (balance 1,000 → expense of 50 with that origin → 950 → delete → 1,000 →
  restore → 950, the restore request carries `operate_for`).

## Verification
- `npm run test:cov`: 40 files, 357 tests, **100%** statements, branches, functions and lines; `npm run lint` and
  `npm run build` pass.
- Playwright against the local module-api built from its `feature/20261115-finan-linked-adjustment` branch and the
  local Docker database: **9/9**, twice in a row. The first run of the day failed `dashboard.spec.js` once
  (a `waitForResponse` timeout while the dev server was starting cold); it passed alone and in both later runs.

## Release and rollback
**After module-api #17** (the API must undo on delete first; with the old API a restore that sends the origin would
take the value a second time). Then `npm run build && npm run up` from `main`; confirm `sw.js` 2.1.49 and the bundle.
Rollback: revert, with the API's revert.

## Version history
| Date | Change |
|---|---|
| 2026-11-15 | Created; unit 100% (357), Playwright 9/9 local against the v0.10 API |
