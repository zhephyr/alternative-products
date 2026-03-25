import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Search Flow', () => {
  test('User can upload an image and view similar products', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Ensure the home page loaded
    await expect(page.locator('text=Upload Image').first()).toBeVisible();

    // Prepare a mock image file for upload
    const filePath = path.join(__dirname, 'fixtures', 'dummy.png');

    // Upload the file
    // The UploadZone component uses an invisible file input spanning the absolute inset
    await page.locator('input[type="file"]').setInputFiles(filePath);

    // After upload, the app should show a loading state 
    await expect(page.locator('text=Finding similar products')).toBeVisible({ timeout: 5000 });

    // After mock analysis (which takes a few seconds from the backend agent), results should appear
    await expect(page.locator('text=Similar Matches')).toBeVisible({ timeout: 15000 });
    
    // Check that at least one product card loaded
    // Check that at least one product card loaded
    await expect(page.locator('img[alt]').nth(1)).toBeVisible({ timeout: 15000 });
  });
});
