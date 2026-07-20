#!/usr/bin/env node
/**
 * Standalone post-deploy smoke check -- drives a real Chromium browser
 * against a *deployed* instance of this SPA (not the dev server, not a
 * mock) and confirms the bundle actually boots and its key UI renders.
 * This is the frontend analogue of module-api's scripts/smoke-test.js, and
 * structurally mirrors animecream-react's scripts/smoke-check.mjs, scoped
 * the same way: "does the deployed bundle work", not full behavioral
 * coverage (that's test/e2e/'s job, run pre-deploy against a local
 * backend). See docs/specification-roadmap.md, Phase 4.
 *
 * A plain HTTP fetch can't do this check: this app is a client-rendered
 * SPA, so the raw HTML response is just the empty #root shell -- only a
 * real browser executing the bundle can confirm the login form actually
 * renders from real client-side React, not a server-rendered page.
 *
 * Read-only: never logs in, never submits the form. Confirms structural
 * presence of the login form, not a real login (that needs real
 * credentials and belongs to test/e2e/auth.spec.js instead).
 *
 * Defaults to the real production frontend (https://finan.animecream.com/)
 * -- note this is deliberately *not* set.json's `base_url`
 * (https://info.animecream.com/), which is the module-api backend's URL,
 * not this app's. This frontend's own domain isn't written down anywhere
 * else in this repo (README.md has no domain; the FTP deploy script
 * com/db-sync-FTP-both.bat reads credentials/paths from untracked local
 * .txt files with no domain committed either) -- confirmed directly with
 * the user rather than guessed.
 *
 * Usage:
 *   node scripts/smoke-check.mjs [url]
 *   SMOKE_URL=https://finan.animecream.com/ node scripts/smoke-check.mjs
 *   npm run smoke -- https://finan.animecream.com/
 *
 * Exit code 0 if every check passes, 1 otherwise -- suitable as a deploy-
 * pipeline gate.
 */

import { chromium } from '@playwright/test';

const url = process.argv[2] || process.env.SMOKE_URL || 'https://finan.animecream.com/';

const results = [];

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (error) {
    results.push({ name, ok: false, error: error.message || String(error) });
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    ${error.message || error}`);
  }
}

async function main() {
  console.log(`\nSmoke checking ${url}\n`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await check('page loads and responds', async () => {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (!response || !response.ok()) {
      throw new Error(`expected a 2xx response, got ${response && response.status()}`);
    }
  });

  await check('React app mounts into #root', async () => {
    const root = page.locator('#root');
    await root.waitFor({ state: 'attached', timeout: 10000 });
    const hasChildren = await root.evaluate((el) => el.childElementCount > 0);
    if (!hasChildren) throw new Error('#root is empty -- the bundle did not mount');
  });

  await check('the login form is present (no real login attempted)', async () => {
    // This app has no public/unauthenticated view -- Home.jsx renders the
    // login form directly whenever no user is logged in (see
    // docs/specification-roadmap.md, Phase 4's own notes on this). A fresh,
    // unauthenticated browser session should always land on it.
    await page.locator('#username').waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('#password').waitFor({ state: 'visible', timeout: 5000 });
  });

  await check('the login button is present and enabled', async () => {
    const loginButton = page.locator('.btn-primary.btn-block');
    await loginButton.waitFor({ state: 'visible', timeout: 5000 });
    if (!(await loginButton.isEnabled())) throw new Error('login button is present but disabled');
  });

  await check('no uncaught JS errors during load', async () => {
    if (consoleErrors.length > 0) {
      throw new Error(`console/page errors: ${consoleErrors.slice(0, 3).join(' | ')}`);
    }
  });

  await browser.close();

  console.log('');
  const failed = results.filter((r) => !r.ok);
  const passed = results.length - failed.length;
  console.log(`${passed}/${results.length} checks passed.`);

  if (failed.length > 0) {
    console.log('\nFailed checks:');
    failed.forEach((r) => console.log(`  - ${r.name}: ${r.error}`));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('\nSmoke check crashed unexpectedly:', error.message);
  process.exitCode = 1;
});
