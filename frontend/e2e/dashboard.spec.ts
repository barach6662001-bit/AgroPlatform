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

test.describe('Dashboard', () => {
  test('should display dashboard after login', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL('/');
    // Dashboard should have some content
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Logout', () => {
  test('should logout and redirect to login', async ({ page }) => {
    await login(page);

    // Find and click the user menu / avatar / logout button
    const logoutBtn = page.getByText(/вийти|logout|вихід/i).first();
    if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutBtn.click();
    } else {
      // Try clicking user avatar or dropdown trigger
      const avatar = page.locator('.ant-avatar, .ant-dropdown-trigger').first();
      if (await avatar.isVisible({ timeout: 3000 }).catch(() => false)) {
        await avatar.click();
        await page.getByText(/вийти|logout|вихід/i).first().click();
      }
    }

    // After logout, should be on login page
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });
});
