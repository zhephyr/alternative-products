import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('User can register, view profile, and logout', async ({ page }) => {
    // Unique test user
    const testUsername = `user_${Date.now()}`;
    const testPassword = 'securepassword123';

    await page.goto('/');

    // Ensure the home page loaded
    await expect(page.locator('text=alt.it').first()).toBeVisible();

    // Click Log In
    await page.click('button:has-text("Log In")');
    
    // Switch to Register mode in AuthModal
    await page.click('text=Create one');

    // Fill registration form
    await page.fill('input[type="text"]', testUsername);
    await page.fill('input[type="password"]', testPassword);
    
    // Submit registration
    await page.click('button:has-text("Sign Up")');

    // Wait for the modal to close and the profile button to appear
    const profileBtn = page.locator('#nav-profile-btn');
    await expect(profileBtn).toBeVisible({ timeout: 5000 });

    // Open profile dropdown
    await profileBtn.click();

    // Verify username is displayed in the dropdown
    await expect(page.locator('role=menu').locator(`text=${testUsername}`)).toBeVisible();

    // Click logout
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('log out');
      await dialog.accept();
    });
    await page.click('button:has-text("Logout")');

    // Verify "Log In" button is back
    await expect(page.locator('button:has-text("Log In")')).toBeVisible();
  });
});
