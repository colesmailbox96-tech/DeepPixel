import { test, expect } from '@playwright/test';

/**
 * Phase 4 — Offline smoke test.
 * Verifies the game boots and shows the hub scene even when offline (after initial cache).
 *
 * Strategy:
 *   1. Load the page online to warm the service worker cache.
 *   2. Go offline (emulate network disconnection).
 *   3. Reload — the app shell should load from the service worker cache.
 *   4. Verify the canvas is visible (game boots).
 */
test('game boots offline after initial cache', async ({ page, context }) => {
  // 1. Warm cache — first visit must be online
  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 15_000 });

  // Give the service worker a moment to cache assets
  await page.waitForTimeout(2000);

  // 2. Go offline
  await context.setOffline(true);

  // 3. Reload
  await page.reload({ waitUntil: 'domcontentloaded' });

  // 4. Canvas should still appear — app shell loaded from cache
  await expect(canvas).toBeVisible({ timeout: 15_000 });

  // Verify the game container exists
  const container = page.locator('#game-container');
  await expect(container).toBeVisible();

  // Cleanup: go back online
  await context.setOffline(false);
});
