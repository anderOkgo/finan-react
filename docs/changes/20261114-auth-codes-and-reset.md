# Password reset in the hidden login panel

**Date:** 2026-11-14 · **Branch:** `feature/20261114-auth-codes-and-reset` · **Released in:** https://finan.animecream.com, 2026-11-14 (PR #11, sw.js 2.1.46)
**Implements:** `module-docs/apps/auth/SPEC.md` v0.5 — R.2 "Where it shows" (P5, P7), C4 and C5 from the front, E10;
design `module-docs/apps/finan/design/Login.dc.html` (tweak *Reset step*)
**Change ID:** `20261114-auth-codes-and-reset` (the same in `module-data` and `module-api`)

## Summary
The panel that opens after 10 taps on Log in now also holds "Forgot your password?" under the register form,
and stays hidden like it. Step 1: the email → "If an account uses this email, a code was sent. It lasts 15
minutes." Step 2: the code, the new password and its repeat → "Password changed. You can log in now." A wrong
or expired code shows "Invalid or expired code"; two different new passwords are refused before calling the API.

## Files
- `src/components/Auth/ResetPassword/ResetPassword.jsx` + `.css` (new): the two steps; the email is read-only on
  step 2; the code field keeps digits only; one request at a time; "Offline" when the server is unreachable.
- `src/components/Home/Home.jsx`: renders it inside the hidden panel, after Register.
- `src/services/auth.service.js`: `requestPasswordReset(email)` (C4), `confirmPasswordReset(email, code,
  newPassword)` (C5), same `{ message } | { err: { message } }` shape as `register`.
- `src/hooks/useLanguage.jsx`: the new texts and API messages in English and Spanish (same keys in both; the
  `translations` test checks it). Also "Verification code expired" and "Too many requests…" for registration.
- Tests: `ResetPassword.test.jsx` (new), `auth.service.test.js`, `Home.test.jsx` (E10); E2E
  `test/e2e/password-reset.spec.js` (new).

## Verification
- `npm run test:cov`: 39 files, 331 tests, **100%** statements (1,614), branches (842), functions and lines.
- `npm run lint`, `npm run build`: pass.
- Playwright against the local module-api built from its branch and the local Docker database (no real data;
  emails disabled): **6/6** — the 5 existing specs (login, chart and currency, movement CRUD) and the new one:
  hidden until the 10th tap, step 1 answer, read-only email, mismatched passwords refused, a wrong code refused
  by the real API.
- The full reset with a real code is covered by module-api's E2E (32/32).

## Release and rollback
Order (playbook E.4): module-data migration 0002 → module-api → this front (`npm run bup`). Before the API is
deployed the new panel would get 404s, so it goes last. Rollback: revert the PR and deploy.

## Version history
| Date | Change |
|---|---|
| 2026-11-14 | Created; unit 100%, Playwright 6/6 local |
