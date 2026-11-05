# Information banners and small gaps

**Date:** 2026-11-05 · **Branch:** `fix/20261105-finan-small-gaps` · **Released in:** https://finan.animecream.com, 2026-11-05
**Implements:** `module-docs/apps/finan/SPEC.md` v0.4, gaps G1, G2, G3, G4, G8, G9
**Change ID:** `20261105-finan-small-gaps`

## Summary
The final trip banner finds its row by the `final-trip` key instead of position 5, and neither banner can show `$NaN`
any more. The unreachable emoji strip and the unused `currentMonthExpenses` state are gone.

## Notes
- `view_final_trip_info` already has a stable key, so no data change was needed.
- Without data a banner still shows the existing marker, `-$1.00`.
- Rejecting the whole keystroke with an emoji stays, with its message: only the dead line went.
- `monthDiff` is unchanged: every caller passes a `Date`, so G4 never happens in the app.

## Release and rollback
`npm run bup`, after the API. Rollback: revert and deploy.

## Verification
Unit, lint, build and local E2E pass. In production, with read-only requests: the served bundle matches the build and
has the `final-trip` key, and `sw.js` matches. The banners with real data were not seen: the owner confirms them.

## Version history
| Date | Change |
|---|---|
| 2026-11-05 | Created |
