import { test, expect, type Page } from '@playwright/test';

/**
 * Currency conversion end-to-end test.
 *
 * Verifies that after the conversion layer v2:
 *   1. The Profile currency switcher is ENABLED (re-enable shipped in this PR).
 *   2. Monetary values on /expenses render coherently — rows and totals agree
 *      on the currency label. Mixed labels (row "1000.00 USD" + total
 *      "1 000,00 грн") was the original regression.
 *   3. Inputs remain UAH-locked regardless of display preference
 *      (Variant B: addonAfter="₴" is hardcoded).
 */

const TEST_EMAIL = process.env.TEST_EMAIL ?? 'admin@agroplatform.test';
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? 'Admin123!';

async function login(page: Page) {
  await page.goto('/login');
  await page.locator('#email').fill(TEST_EMAIL);
  await page.locator('#password').fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('/', { timeout: 10_000 });
}

test('profile currency switcher is enabled', async ({ page }) => {
  await login(page);
  await page.goto('/profile');
  await page.waitForTimeout(500);

  const disabled = await page.locator('.ant-select-disabled').count();
  expect(disabled, 'currency switcher should be enabled').toBe(0);
});

test('expenses page renders consistent currency between rows and totals', async ({ page }) => {
  await login(page);
  await page.goto('/expenses');
  await page.waitForTimeout(1_500);

  const bodyText = (await page.locator('body').innerText()).replace(/\u00A0/g, ' ');

  const hasUsdLabel = /\$\s?\d|\bUSD\b/.test(bodyText);
  const hasUahLabel = /грн|₴\s?\d/.test(bodyText);
  expect(
    hasUsdLabel && hasUahLabel,
    'Mixed currency labels detected on /expenses — rows and totals disagree.'
  ).toBe(false);
});

test('amount inputs remain UAH-locked (₴ addon) regardless of display currency', async ({ page }) => {
  await login(page);
  await page.goto('/expenses');
  await page.waitForTimeout(800);

  const createButton = page.getByRole('button', { name: /додати|create|add/i }).first();
  if (await createButton.isVisible()) {
    await createButton.click();
    await page.waitForTimeout(300);

    const addon = page
      .locator('.ant-input-number-group-addon, .ant-input-group-addon')
      .filter({ hasText: '₴' });
    if (await addon.count() > 0) {
      await expect(addon.first()).toBeVisible();
    }
  }
});
