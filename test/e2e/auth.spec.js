import { test, expect } from '@playwright/test';

// Real login against a real account (see .env.e2e.local.example) -- this
// app has no public/unauthenticated view (Home renders the Login form
// directly whenever no user is logged in), so this is the entry-point
// golden path everything else depends on. No mocking: drives the real
// built app in a real browser against a real running module-api instance.
const login = process.env.E2E_LOGIN;
const password = process.env.E2E_PASSWORD;

test.describe('Login (real account)', () => {
  test.skip(!login || !password, 'E2E_LOGIN/E2E_PASSWORD not set -- see .env.e2e.local.example');

  test('shows the login form when logged out', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('logs in with a real account and reaches the dashboard', async ({ page }) => {
    await page.goto('/');

    await page.locator('#username').fill(login);
    await page.locator('#password').fill(password);
    await page.locator('.btn-primary.btn-block').click();

    // On success the Login form is replaced by <Tab /> (the dashboard).
    await expect(page.locator('#username')).toHaveCount(0, { timeout: 10000 });
  });
});
