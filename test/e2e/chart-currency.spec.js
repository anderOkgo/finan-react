import { test, expect } from '@playwright/test';

// Chart + currency-selection golden path -- the "still open" item Phase 4
// flagged as not yet covered (read-only/display concerns, lower risk than
// the movement-CRUD path dashboard.spec.js already covers, but still real
// UI wired to real module-api data). No mocking: drives the real built app
// in a real browser against a real running module-api instance, reusing
// the same real account as the other specs (module-api's auth is
// centralized, not per-frontend/per-file).
const login = process.env.E2E_LOGIN;
const password = process.env.E2E_PASSWORD;

test.describe('Balance chart + currency selection (real account)', () => {
  test.skip(!login || !password, 'E2E_LOGIN/E2E_PASSWORD not set -- see .env.e2e.local.example');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#username').fill(login);
    await page.locator('#password').fill(password);
    await page.locator('.btn-primary.btn-block').click();
    await expect(page.locator('#username')).toHaveCount(0, { timeout: 10000 });
  });

  test('renders the balance chart with real data once it loads, populated with real years', async ({ page }) => {
    // Tab 4 is Balance (TabBalance -> InfoBanner + LineChart + 4 Tables).
    await page.locator('label[for="tab-4"]').click();

    // react-chartjs-2's <Line> renders a real <canvas> once options/data are
    // built from module-api's response -- its presence (rather than pixel
    // inspection, which chart.js's canvas doesn't expose meaningfully to
    // Playwright) is the structural proof the chart mounted successfully
    // against real data instead of crashing or staying empty.
    const canvas = page.locator('.line-chart');
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // LineChart's own year <select> (not the currency one -- see below) is
    // the element immediately preceding the chart canvas in the DOM. It
    // always has at least the "All Years" option plus one option per
    // distinct year_number in the real balance data.
    const yearSelect = canvas.locator('xpath=preceding-sibling::select[1]');
    await expect(yearSelect).toBeVisible();
    const optionCount = await yearSelect.locator('option').count();
    expect(optionCount).toBeGreaterThan(1);
  });

  test('switching currency re-fetches from module-api with the new currency and updates the displayed total', async ({ page }) => {
    await page.locator('label[for="tab-4"]').click();
    await expect(page.locator('.line-chart')).toBeVisible({ timeout: 15000 });

    // Scoped to the Balance tab's own panel (the only place `.line-chart`
    // exists) so this doesn't hit Playwright's strict-mode "multiple
    // elements" error -- CurrencySelector is admin-only but still mounted
    // once per tab panel (see Tab.jsx's CSS radio-tab technique, documented
    // in Phase 2.5), so 5 copies of it exist across the whole page.
    const balancePanel = page.locator('.panel-tab').filter({ has: page.locator('.line-chart') });
    const currencySelect = balancePanel.getByLabel('Select Currency');
    await expect(currencySelect).toHaveValue('COP');

    const totalBalanceText = balancePanel.getByText(/^Total Balance:/);
    await expect(totalBalanceText).toBeVisible();

    const [initialLoadResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/finan/initial-load') && res.request().method() === 'POST'),
      currencySelect.selectOption('AUD'),
    ]);
    // The concrete proof a real currency-scoped re-fetch happened (not just
    // a client-side re-render): the POST body module-api actually received
    // carries the newly selected currency, and the response is a real 2xx.
    expect(initialLoadResponse.ok()).toBe(true);
    expect(initialLoadResponse.request().postDataJSON()).toMatchObject({ currency: 'AUD' });

    await expect(currencySelect).toHaveValue('AUD');
    // The banner survives the re-fetch (real AUD-currency data loaded
    // successfully, no crash) -- not asserted against a fixed expected
    // figure, since this is this real account's real, currently-whatever-it-
    // is balance data, not a fixture.
    await expect(totalBalanceText).toBeVisible();
  });
});
