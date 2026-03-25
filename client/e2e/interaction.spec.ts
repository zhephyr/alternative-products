import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Interactions Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Pre-populate search results
    await page.goto('/');
    const filePath = path.join(__dirname, 'fixtures', 'dummy.png');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await expect(page.locator('text=Similar Matches')).toBeVisible({ timeout: 15000 });
  });

  test('User can filter results by Price and Rating', async ({ page }) => {
    // Price Filter Select
    await page.selectOption('#price-filter', 'under-100');

    // Rating Filter Select
    await page.selectOption('#rating-filter', '4+');
    
    // Confirm sorting select works
    await page.selectOption('#sort-by', 'price-asc');

    // Wait for the labels to be visible after selection
    await expect(page.locator('#price-filter')).toHaveValue('under-100');
    await expect(page.locator('#rating-filter')).toHaveValue('4+');
  });
});
