import { test, expect } from '@playwright/test';

test('game boots and shows hub scene', async ({ page }) => {
  await page.goto('/');

  // Wait for the Phaser canvas to appear
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 15_000 });

  // Verify the game container exists
  const container = page.locator('#game-container');
  await expect(container).toBeVisible();
});
