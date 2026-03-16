import { test, expect } from '@playwright/test';

/**
 * Phase 4 — Offline smoke test.
 * Verifies the game boots and shows the hub scene even when offline (after initial cache).
 *
 * Strategy:
 *   1. Load the page online to warm the service worker cache.
 *   2. Wait for the service worker to activate.
 *   3. Go offline (emulate network disconnection).
 *   4. Reload — the app shell should load from the service worker cache.
 *   5. Verify the canvas is visible (game boots).
 */
test('game boots offline after initial cache', async ({ page, context }) => {
  // 1. Warm cache — first visit must be online
  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 15_000 });

  // 2. Wait for the service worker to activate and take control
  await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return;
    // If no registrations exist yet, nothing to wait for
    const regs = await navigator.serviceWorker.getRegistrations();
    if (regs.length === 0) return;
    const reg = await navigator.serviceWorker.ready;
    // If there's no controller yet, wait for the controllerchange event
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
          once: true,
        });
        // Resolve anyway if the installing/waiting worker becomes active
        if (reg.active) resolve();
      });
    }
  });

  // 3. Go offline
  await context.setOffline(true);

  // 4. Reload
  await page.reload({ waitUntil: 'domcontentloaded' });

  // 5. Canvas should still appear — app shell loaded from cache
  await expect(canvas).toBeVisible({ timeout: 15_000 });

  // Verify the game container exists
  const container = page.locator('#game-container');
  await expect(container).toBeVisible();

  // Cleanup: go back online
  await context.setOffline(false);
});
