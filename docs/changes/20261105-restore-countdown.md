# Show the countdown table again

**Date:** 2026-11-05 · **Branch:** `feat/20261105-restore-countdown` · **Released in:** https://finan.animecream.com, 2026-11-05
**Implements:** `module-docs/apps/finan/SPEC.md` v0.7, §2 Information
**Change ID:** `20261105-restore-countdown`

## Summary
The owner asked to bring the countdown table back, so this undoes `20261105-hide-countdown`.

## Notes
The end date stays 2026-11-20. After it the table does not stop: elapsed and remaining use absolute differences, so
"remaining" starts to grow.

## Release and rollback
`npm run bup`. Rollback: revert and deploy.

## Verification
Unit, lint, build and local E2E pass. In production: the served bundle matches the build and has the countdown again,
and `sw.js` matches.

## Version history
| Date | Change |
|---|---|
| 2026-11-05 | Created |
