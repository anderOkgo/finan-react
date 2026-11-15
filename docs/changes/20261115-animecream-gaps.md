# helpHttp reads errors and timeouts like animecream-react's (Animecream G9)

**Date:** 2026-11-15 · **Branch:** `feature/20261115-animecream-gaps` (on top of `feature/20261115-finan-recoverable-delete`) · **Released in:** https://finan.animecream.com, 2026-11-15 (PR #14, after #13; `sw.js` 2.1.48)
**Implements:** `module-docs/apps/animecream/SPEC.md` v0.8 — G9 (P11)
**Change ID:** `20261115-animecream-gaps` (the same in `animecream-react` for G2 and G6, and in `module-api` for G3)

## Summary
G9 said Finanz's `helpHttp.js` lacks timeouts; it has them (`set.defaul_fetch_request`, `AbortController`). What
differed, and is now the same as `animecream-react/src/helpers/helpHttp.js`:
- **A timeout** returned the browser's own abort text ("signal is aborted without reason"), shown as is in the
  form's message. It now returns "Request timeout", translated ("Tiempo de espera agotado" in Spanish).
- **An API error sent as `{ error: '…' }`** (for example `validateToken`'s "Unauthorized: …") or **as field
  messages** (`{ field: '…' }`) was read as "Unknown error". Both are read now.

Not ported: `FormData` bodies, which only Animecream's image upload needs.

## Files
- `src/helpers/helpHttp.js`: `normalizeHttpErrorMessage` reads `error` and field messages; an `AbortError` becomes
  "Request timeout".
- `src/hooks/useLanguage.jsx`: "Request timeout" in English and Spanish.
- `src/helpers/__tests__/helpHttp.test.js`: the new shapes, the abort, a number body.
- `public/sw.js`: 2.1.47 → 2.1.48 (this branch sits on PR #13's, which brings 2.1.47).

## Verification
- `npm run test:cov`: 39 files, 332 tests on this branch alone (before the rebase onto #13), **100%** statements,
  branches, functions and lines; `npm run lint` and `npm run build` pass. Rerun after the rebase: see Version history.

## Release and rollback
Merge **after** PR #13 (this branch is built on it). Then `npm run build && npm run up` from `main`; confirm
`sw.js` 2.1.48 and the bundle. Rollback: revert.

## Version history
| Date | Change |
|---|---|
| 2026-11-15 | Created; unit 100% (332), lint and build pass |
| 2026-11-15 | Rebased onto PR #13's branch, `sw.js` 2.1.48: unit 100% (40 files, 352 tests), lint and build pass |
