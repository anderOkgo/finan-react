import { test, expect } from '@playwright/test';

// Dashboard + movement CRUD golden path -- the one E2E suite here that
// mutates the real, shared dev database with real user financial data
// (not a throwaway/CI-provisioned one). No mocking: drives the real built
// app in a real browser against a real running module-api instance.
//
// Unlike animecream-react's admin.spec.js, Form.jsx *does* have a real
// delete button in edit mode, so the whole CRUD lifecycle (including
// delete) happens through the real UI, not an API bypass. A safety-net
// afterEach still exists in case a failed test leaves a movement behind
// (real hard-delete here, unlike series' soft-delete -- see
// module-api's own roadmap note on this difference).
const login = process.env.E2E_LOGIN;
const password = process.env.E2E_PASSWORD;

test.describe('Dashboard: movement CRUD', () => {
  test.skip(!login || !password, 'E2E_LOGIN/E2E_PASSWORD not set -- see .env.e2e.local.example');

  let createdMovementId;

  const getToken = async (request) => {
    const resp = await request.post('http://localhost:3001/api/users/login', { data: { username: login, password } });
    const { token } = await resp.json();
    return token;
  };

  test.afterEach(async ({ request }) => {
    if (!createdMovementId) return;
    const token = await getToken(request);
    await request.delete(`http://localhost:3001/api/finan/delete/${createdMovementId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { username: login },
    });
    createdMovementId = undefined;
  });

  test('creates, edits, and deletes a movement via the real dashboard', async ({ page, request }) => {
    const movementName = `__E2E_TEST_MOVEMENT_${Date.now()}__`;

    await page.goto('/');
    await page.locator('#username').fill(login);
    await page.locator('#password').fill(password);
    await page.locator('.btn-primary.btn-block').click();
    await expect(page.locator('#username')).toHaveCount(0, { timeout: 10000 });

    // Tab 1 (Input) is the default view -- fill and submit the real form.
    // Uses "now" as the movement date, not an arbitrary fixed one: the
    // real movement table is sorted newest-first with only 20 rows per
    // page (1000+ real records exist), so an old date would bury the
    // fixture past page 1 and every row-lookup below would time out.
    const now = new Date();
    const nowLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    await page.locator('#movement_name').fill(movementName);
    await page.locator('#movement_val').fill('12.34');
    await page.locator('#movement_type').selectOption('2'); // Expenses
    await page.locator('#movement_date').fill(nowLocal);
    await page.locator('#movement_tag').fill('e2e');

    const [createResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/finan/insert') && res.request().method() === 'POST'),
      page.locator('input[type="submit"]').click(),
    ]);
    expect(createResponse.ok()).toBe(true);

    // Resolve the real id via the same initial-load endpoint the app
    // itself uses, rather than reading it out of the (partially
    // CSS-hidden) id column -- more reliable, and what afterEach's
    // cleanup safety net needs anyway.
    const token = await getToken(request);
    const loadResp = await request.post('http://localhost:3001/api/finan/initial-load', {
      headers: { Authorization: `Bearer ${token}` },
      data: { date: new Date().toISOString().slice(0, 10), currency: 'COP' },
    });
    const loadBody = await loadResp.json();
    const createdRow = loadBody.data.movements.find((m) => m.name === movementName);
    expect(createdRow).toBeTruthy();
    createdMovementId = createdRow.id;

    // Switch to the General tab and confirm the movement is listed.
    // TabGeneral renders 3 tables (Movement, Name Summary, Type Summary);
    // a distinctively-named movement gets its own row in both the first
    // and second, so scope every lookup to the first (Movement Table).
    const movementRow = () => page.locator('tr', { hasText: movementName }).first();
    await page.locator('label[for="tab-2"]').click();
    await expect(movementRow()).toBeVisible({ timeout: 15000 });

    // Double-click it to edit -- switches back to the Input tab with the
    // form pre-filled (see TabGeneral.jsx's handleRowDoubleClick).
    await movementRow().dblclick();
    await expect(page.locator('#movement_name')).toHaveValue(movementName);
    await page.locator('#movement_val').fill('99.99');

    const [updateResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes(`/api/finan/update/${createdMovementId}`) && res.request().method() === 'PUT'),
      page.locator('input[type="submit"]').click(),
    ]);
    expect(updateResponse.ok()).toBe(true);

    // Confirm the update landed for real, then delete via the real
    // Delete button (only rendered in edit mode).
    await page.locator('label[for="tab-2"]').click();
    await expect(movementRow()).toContainText('99.99', { timeout: 15000 });

    await movementRow().dblclick();
    page.once('dialog', (dialog) => dialog.accept());
    const [deleteResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes(`/api/finan/delete/${createdMovementId}`) && res.request().method() === 'DELETE'),
      page.locator('.delete-button').click(),
    ]);
    expect(deleteResponse.ok()).toBe(true);
    createdMovementId = undefined; // already deleted through the UI -- afterEach has nothing to do

    await page.locator('label[for="tab-2"]').click();
    await expect(page.locator('tr', { hasText: movementName })).toHaveCount(0, { timeout: 15000 });
  });
});
