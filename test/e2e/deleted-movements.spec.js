import { test, expect } from '@playwright/test';

// Deleted movements, kept 7 days on the device (module-docs/apps/finan/SPEC.md v0.9, §2.2.1, H1, H2,
// H3, H5, H9). Real app, real local module-api and its local Docker database (no real data): a movement
// is created, deleted through the UI, then restored or deleted for good from the Deleted table.
// Doc: docs/changes/20261115-finan-recoverable-delete.md
const API = 'http://localhost:3001';
const login = process.env.E2E_LOGIN;
const password = process.env.E2E_PASSWORD;

const pad = (n) => String(n).padStart(2, '0');
const nowLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

test.describe('Deleted movements (Finanz §2.2.1)', () => {
  test.skip(!login || !password, 'E2E_LOGIN/E2E_PASSWORD not set -- see .env.e2e.local.example');

  let movementName;

  const token = async (request) => {
    const resp = await request.post(`${API}/api/users/login`, { data: { username: login, password } });
    return (await resp.json()).token;
  };
  const movementsNamed = async (request, name) => {
    const resp = await request.post(`${API}/api/finan/initial-load`, {
      headers: { Authorization: `Bearer ${await token(request)}` },
      data: { date: new Date().toISOString().slice(0, 10), currency: 'COP' },
    });
    return (await resp.json()).data.movements.filter((m) => m.name === name);
  };

  // Safety net: whatever the test left behind with its name is deleted on the server
  test.afterEach(async ({ request }) => {
    for (const m of await movementsNamed(request, movementName)) {
      await request.delete(`${API}/api/finan/delete/${m.id}`, {
        headers: { Authorization: `Bearer ${await token(request)}` },
        data: { username: login },
      });
    }
  });

  const signIn = async (page) => {
    await page.goto('/');
    await page.locator('#username').fill(login);
    await page.locator('#password').fill(password);
    await page.locator('.btn-primary.btn-block').click();
    await expect(page.locator('#username')).toHaveCount(0, { timeout: 10000 });
  };

  const createAndDelete = async (page) => {
    await page.locator('#movement_name').fill(movementName);
    await page.locator('#movement_val').fill('12.34');
    await page.locator('#movement_type').selectOption('2');
    await page.locator('#movement_date').fill(nowLocal());
    await page.locator('#movement_tag').fill('e2e');
    const [created] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/finan/insert') && res.request().method() === 'POST'),
      page.locator('input[type="submit"]').click(),
    ]);
    expect(created.ok()).toBe(true);

    const row = () => page.locator('tr', { hasText: movementName }).first();
    await page.locator('label[for="tab-2"]').click();
    await expect(row()).toBeVisible({ timeout: 15000 });
    await row().dblclick();
    page.once('dialog', (dialog) => dialog.accept());
    const [deleted] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/finan/delete/') && res.request().method() === 'DELETE'),
      page.locator('.delete-button').click(),
    ]);
    expect(deleted.ok()).toBe(true);
  };

  test('H1, H2, H3: a deleted movement shows in Deleted and comes back with Restore', async ({ page, request }) => {
    movementName = `__E2E_DELETED_${Date.now()}__`;
    await signIn(page);
    await createAndDelete(page);

    // H1: on the Input tab, under the form
    await page.locator('label[for="tab-1"]').click();
    await expect(page.getByText('Deleted (1)')).toBeVisible();
    const deletedRow = page.locator('tr', { hasText: movementName });
    await expect(deletedRow).toBeVisible();
    expect(await movementsNamed(request, movementName)).toHaveLength(0);

    // H2, H3: restore sends it again as new, with no origin
    const [restored] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/finan/insert') && res.request().method() === 'POST'),
      deletedRow.getByTitle('Restore').click(),
    ]);
    expect(restored.ok()).toBe(true);
    expect('operate_for' in restored.request().postDataJSON()).toBe(false);
    await expect(page.getByText(/Deleted \(\d+\)/)).toHaveCount(0);
    expect(await movementsNamed(request, movementName)).toHaveLength(1);
    await page.locator('label[for="tab-2"]').click();
    await expect(page.locator('tr', { hasText: movementName }).first()).toBeVisible({ timeout: 15000 });
  });

  test('H5, H9: delete for good asks and sends nothing; logging out removes the list', async ({ page, request }) => {
    movementName = `__E2E_DELETED_${Date.now()}__`;
    await signIn(page);
    await createAndDelete(page);
    await page.locator('label[for="tab-1"]').click();
    const deletedRow = page.locator('tr', { hasText: movementName });
    await expect(deletedRow).toBeVisible();

    // H5: declined, the row stays; accepted, it goes and nothing reaches the API
    page.once('dialog', (dialog) => dialog.dismiss());
    await deletedRow.getByTitle('Delete').click();
    await expect(deletedRow).toBeVisible();

    const calls = [];
    page.on('request', (req) => req.url().includes('/api/finan/') && calls.push(req.method()));
    page.once('dialog', (dialog) => dialog.accept());
    await deletedRow.getByTitle('Delete').click();
    await expect(deletedRow).toHaveCount(0);
    expect(calls).toEqual([]);
    expect(await movementsNamed(request, movementName)).toHaveLength(0);

    // H9: a second delete kept, then log out
    movementName = `__E2E_DELETED_${Date.now()}__`;
    await createAndDelete(page);
    expect(await page.evaluate(() => localStorage.getItem('deleted'))).not.toBeNull();
    // Desktop width: the menu links show without the hamburger
    await page.getByText('Session', { exact: true }).hover();
    await page.getByText('Logout', { exact: true }).click();
    await expect(page.locator('#username')).toBeVisible({ timeout: 10000 });
    expect(await page.evaluate(() => localStorage.getItem('deleted'))).toBeNull();
  });
});
