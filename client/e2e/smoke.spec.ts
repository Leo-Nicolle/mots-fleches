import { test, expect } from '@playwright/test';

test('the app boots and renders the root view', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#app')).not.toBeEmpty({ timeout: 20_000 });
  await expect(page).toHaveTitle(/MotsFlex/);
});

test('the login route renders without authentication', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('#app')).not.toBeEmpty({ timeout: 20_000 });
  await expect(page).toHaveTitle(/Se connecter/);
});
