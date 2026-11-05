# Hide the countdown table

**Date:** 2026-11-05 · **Branch:** `feat/20261105-hide-countdown` · **Released in:** https://finan.animecream.com, 2026-11-05
**Implements:** `module-docs/apps/finan/SPEC.md` v0.6, §2 Information
**Change ID:** `20261105-hide-countdown`

## Summary
The Information tab no longer shows the countdown table, whose fixed date ends on 2026-11-20. The owner asked to hide it
for now.

## Notes
`CountDownEnd.jsx` and its tests stay, so it can return with a new date by rendering it in `TabInfo.jsx` again.

## Release and rollback
`npm run bup`. Rollback: revert and deploy.

## Verification
Unit, lint, build and local E2E pass. In production: the served bundle matches the build and no longer has the countdown,
and `sw.js` matches.

## Version history
| Date | Change |
|---|---|
| 2026-11-05 | Created |
