import { test, expect } from '@playwright/test';

// Auth SPEC v0.5 (E10 and the reset steps, through the real UI and a real local module-api).
// No account is needed: C4 answers the same for any email (D6), and a wrong code is refused with
// one message. The full reset with a real code is covered by module-api's
// scripts/20261114-e2e-auth-codes-and-reset.js, which reads the code from the local database.
const email = `e2e_ui_reset_${Date.now()}@example.com`;
const loginButton = (page) => page.locator('.btn-primary.btn-block').first();

test.describe('Password reset in the hidden panel', () => {
  test('stays hidden until 10 taps on Log in, then asks for a code and refuses a wrong one', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#username')).toBeVisible();

    for (let i = 0; i < 9; i++) await loginButton(page).click();
    await expect(page.locator('#reset-email')).toHaveCount(0);

    await loginButton(page).click();
    await expect(page.locator('#reset-email')).toBeVisible();

    await page.locator('#reset-email').fill(email);
    await page.locator('#reset-email').press('Enter');
    await expect(page.locator('.reset-notice')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#reset-code')).toBeVisible();
    await expect(page.locator('#reset-email')).toHaveAttribute('readonly', '');

    await page.locator('#reset-code').fill('000000');
    await page.locator('#reset-new').fill('newSecret1');
    await page.locator('#reset-repeat').fill('newSecret2');
    await page.locator('#reset-repeat').press('Enter');
    await expect(page.locator('.reset-error')).toBeVisible();

    await page.locator('#reset-repeat').fill('newSecret1');
    await page.locator('#reset-repeat').press('Enter');
    await expect(page.locator('.reset-error')).toHaveText(/Invalid or expired code|Código inválido o vencido/, {
      timeout: 10000,
    });
  });
});
