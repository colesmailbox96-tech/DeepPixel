/**
 * Phase 9 — Atlas Packing Workflow
 *
 * Scans a source directory for individual sprite images, computes a
 * rectangle-packing layout, and emits an AtlasManifest JSON.  The actual
 * pixel compositing is left to an external image tool (e.g. sharp / canvas);
 * this module is responsible for the *layout* and *manifest generation* only.
 *
 * Usage (CLI):
 *   npx ts-node src/atlas-pack.ts --input ./assets/icons --output ./dist/atlas
 */

import type { AtlasEntry, AtlasManifest } from '@echo-party/shared';

// ── Packing Helpers ───────────────────────────────────────────────────────────

/** Maximum atlas dimension (width or height) in pixels. */
export const MAX_ATLAS_SIZE = 2048;

export interface SpriteInput {
  /** Unique identifier for this sprite (file stem). */
  readonly id: string;
  /** Width of the source image in pixels. */
  readonly width: number;
  /** Height of the source image in pixels. */
  readonly height: number;
}

/**
 * Compute power-of-two atlas dimensions that can contain the given total area
 * with a safety margin. Throws if the computed size exceeds `maxSize`.
 */
export function computeAtlasSize(
  sprites: readonly SpriteInput[],
  padding: number,
  maxSize: number = MAX_ATLAS_SIZE,
): number {
  const totalArea = sprites.reduce(
    (sum, s) => sum + (s.width + padding) * (s.height + padding),
    0,
  );
  // Also consider the tallest sprite — the atlas must be at least that tall.
  const maxDim = sprites.reduce(
    (m, s) => Math.max(m, s.width + padding, s.height + padding),
    0,
  );
  // Start at 64 and double until we can fit everything.
  let size = 64;
  while (size < maxDim || size * size < totalArea * 1.5) {
    size *= 2;
  }
  if (size > maxSize) {
    throw new Error(
      `Computed atlas size ${size}×${size} exceeds maximum ${maxSize}×${maxSize}`,
    );
  }
  return size;
}

/**
 * Simple shelf-based rectangle packing. Returns positioned entries.
 *
 * Algorithm:
 *   1. Sort sprites tallest-first.
 *   2. Place sprites on shelves left-to-right, advancing to a new shelf
 *      when the current one is full.
 *   3. If the atlas overflows, retry with double the atlas size.
 */
export function packSprites(
  sprites: readonly SpriteInput[],
  padding: number,
  maxSize: number = MAX_ATLAS_SIZE,
): AtlasManifest {
  const sorted = [...sprites].sort((a, b) => b.height - a.height);
  let atlasSize = computeAtlasSize(sorted, padding, maxSize);

  for (let attempt = 0; attempt < 4; attempt++) {
    const entries: AtlasEntry[] = [];
    let shelfX = 0;
    let shelfY = 0;
    let shelfHeight = 0;
    let overflow = false;

    for (const sprite of sorted) {
      const w = sprite.width + padding;
      const h = sprite.height + padding;

      if (shelfX + w > atlasSize) {
        // Move to new shelf
        shelfX = 0;
        shelfY += shelfHeight;
        shelfHeight = 0;
      }

      if (shelfY + h > atlasSize) {
        overflow = true;
        break;
      }

      entries.push({
        id: sprite.id,
        x: shelfX,
        y: shelfY,
        width: sprite.width,
        height: sprite.height,
      });

      shelfX += w;
      shelfHeight = Math.max(shelfHeight, h);
    }

    if (!overflow) {
      return { atlasWidth: atlasSize, atlasHeight: atlasSize, entries };
    }

    atlasSize *= 2;
    if (atlasSize > maxSize) {
      throw new Error(
        `Atlas overflow: cannot pack ${sprites.length} sprites within ${maxSize}×${maxSize} limit`,
      );
    }
  }

  throw new Error(
    `Atlas overflow: cannot pack ${sprites.length} sprites after multiple size increases`,
  );
}

/**
 * Generate a JSON manifest string from packed entries.
 */
export function generateManifest(manifest: AtlasManifest): string {
  return JSON.stringify(manifest, null, 2);
}
