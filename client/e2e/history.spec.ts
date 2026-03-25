import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Usage History Flow', () => {
  test('User can upload an image and view it in History', async ({ page }) => {
    // 1. Register a fresh user
    const testUsername = `historyuser_${Date.now()}`;
    const testPassword = 'securepassword123';

    await page.goto('/');
    await page.click('button:has-text("Log In")');
    await page.click('text=Create one');
    await page.fill('input[type="text"]', testUsername);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Sign Up")');

    // Wait for auth to complete
    const profileBtn = page.locator('#nav-profile-btn');
    await expect(profileBtn).toBeVisible({ timeout: 5000 });

    // 2. Upload an image
    const filePath = path.join(__dirname, 'fixtures', 'dummy.png');
    await page.locator('input[type="file"]').setInputFiles(filePath);

    // Wait for the results to process completely
    await expect(page.locator('text=Similar Matches')).toBeVisible({ timeout: 15000 });
    // Increase timeout for loading to disappear
    await expect(page.locator('text=Finding similar products')).not.toBeVisible({ timeout: 10000 });

    // 3. Open History Modal
    await page.click('button:has-text("Usage History")');

    // 4. Verify History Modal loads the search
    const historyModal = page.locator('role=dialog');
    await expect(historyModal).toBeVisible();
    await expect(historyModal.locator('text=Usage History')).toBeVisible();

    // Verify at least one item shows with formatting "X matches"
    await expect(page.locator('text=matches').first()).toBeVisible({ timeout: 5000 });
  });
});
