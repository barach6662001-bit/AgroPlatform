import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const TEST_EMAIL = process.env.TEST_EMAIL ?? 'admin@agroplatform.test';
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? 'Admin123!';

async function login(page: Page) {
  await page.goto('/login');
  await page.locator('#email').fill(TEST_EMAIL);
  await page.locator('#password').fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('/', { timeout: 10_000 });
}

function parseLocalizedNumber(value: string): number {
  const normalized = value
    .replace(/\s+/g, ' ')
    .replace(',', '.')
    .trim();

  const match = normalized.match(/(-?[0-9]+(?:\.[0-9]+)?)(?:\s*(млн|тис\.))?/i);
  if (!match) {
    return 0;
  }

  const num = Number(match[1]);
  const suffix = match[2]?.toLowerCase();

  if (suffix?.includes('млн')) return num * 1_000_000;
  if (suffix?.includes('тис')) return num * 1_000;
  return num;
}

async function screenshot(page: Page, dir: string, slug: string) {
  fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: path.join(dir, `${slug}.png`), fullPage: true });
}

test('totals cards audit for economics expenses page', async ({ page }) => {
  await login(page);

  const slug = 'economics';
  await page.goto('/economics');
  await page.waitForTimeout(800);

  await screenshot(page, 'audit/totals-before', slug);

  const totalCard = page.getByTestId('total-card');
  await expect(totalCard).toBeVisible();

  const categoryCards = page.locator('[data-testid^="kpi-card-"]');
  const count = await categoryCards.count();
  expect(count).toBeGreaterThan(0);

  let categoriesSum = 0;
  for (let i = 0; i < count; i += 1) {
    const text = await categoryCards.nth(i).innerText();
    categoriesSum += parseLocalizedNumber(text);
  }

  const totalText = await totalCard.innerText();
  const total = parseLocalizedNumber(totalText);

  // Rounded comparison tolerates formatter precision on abbreviated category cards.
  const roundedCategories = Math.round(categoriesSum);
  const roundedTotal = Math.round(total);

  expect(roundedTotal, `Totals mismatch on /economics: categories=${roundedCategories}, total=${roundedTotal}`).toBe(roundedCategories);

  await screenshot(page, 'audit/totals-after', slug);
});
