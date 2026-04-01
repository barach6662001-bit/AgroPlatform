import { test, expect, type Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_EMAIL ?? 'admin@agroplatform.test';
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? 'Admin123!';

async function login(page: Page) {
  await page.goto('/login');
  await page.locator('#email').fill(TEST_EMAIL);
  await page.locator('#password').fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('/', { timeout: 10_000 });
}

test.describe('Warehouses Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should navigate to warehouses page', async ({ page }) => {
    await page.goto('/warehouses');
    await expect(page.locator('h1, .ant-page-header-heading-title, [class*="title"]').first()).toBeVisible({ timeout: 10_000 });
  });

  test('should navigate to warehouse items', async ({ page }) => {
    await page.goto('/warehouses/items');
    await expect(page).toHaveURL(/\/warehouses\/items/);
  });

  test('should navigate to stock movements', async ({ page }) => {
    await page.goto('/warehouses/movements');
    await expect(page).toHaveURL(/\/warehouses\/movements/);
  });
});
