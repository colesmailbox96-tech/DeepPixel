/**
 * Phase 9 — In-Game Readability Validation Workflow
 *
 * Validates that art assets meet minimum contrast and size requirements
 * so they remain readable on small mobile screens at the game's native
 * resolution (480 × 270 scaled ×3).
 *
 * The validator works on colour pairs, not raw images, making it easy to
 * integrate into both automated CI checks and design-time previews.
 *
 * Usage (programmatic):
 *   import { validateContrast } from './readability-validator';
 *   const result = validateContrast('player-sprite', 'ff0000', '1a1a2e');
 */

import type { HexColor, ReadabilityResult } from '@echo-party/shared';

// ── WCAG Relative Luminance ───────────────────────────────────────────────────

/**
 * Convert a single sRGB channel (0-255) to linear RGB.
 */
function linearize(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Compute WCAG 2.1 relative luminance from a hex colour string.
 * @param hex  6-char hex colour (no # prefix)
 */
export function relativeLuminance(hex: HexColor): number {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Compute the WCAG contrast ratio between two hex colours.
 * Returns a value ≥ 1.  WCAG AA requires ≥ 4.5 for normal text.
 */
export function contrastRatio(fg: HexColor, bg: HexColor): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ── Minimum Contrast Thresholds ───────────────────────────────────────────────

/**
 * Minimum contrast ratios by asset category.
 * Pixel art on dark backgrounds generally needs lower ratios than text,
 * but we still enforce meaningful readability.
 */
export const MIN_CONTRAST = {
  /** Sprites against biome floor tiles. */
  sprite: 2.5,
  /** Icon foreground against its background cell. */
  icon: 3.0,
  /** UI text against panel backgrounds. */
  ui_text: 4.5,
  /** VFX flashes — can be brighter, lower floor. */
  vfx: 2.0,
} as const;

/** Valid contrast category keys. */
export type ContrastCategory = keyof typeof MIN_CONTRAST;

// ── Validation ────────────────────────────────────────────────────────────────

/**
 * Validate a foreground/background colour pair for an asset.
 *
 * @param assetId   Human-readable identifier for the asset.
 * @param fg        Foreground hex colour.
 * @param bg        Background hex colour.
 * @param category  One of the keys in MIN_CONTRAST.
 */
export function validateContrast(
  assetId: string,
  fg: HexColor,
  bg: HexColor,
  category: ContrastCategory = 'sprite',
): ReadabilityResult {
  const ratio = contrastRatio(fg, bg);
  const minimum = MIN_CONTRAST[category];
  return {
    assetId,
    passed: ratio >= minimum,
    contrastRatio: Math.round(ratio * 100) / 100,
    minimumRequired: minimum,
    notes: ratio >= minimum
      ? 'Meets minimum contrast'
      : `Contrast ${ratio.toFixed(2)} below minimum ${minimum} for category "${category}"`,
  };
}

/**
 * Batch-validate an array of colour pairs.
 */
export function validateBatch(
  items: readonly { assetId: string; fg: HexColor; bg: HexColor; category?: ContrastCategory }[],
): ReadabilityResult[] {
  return items.map((item) => validateContrast(item.assetId, item.fg, item.bg, item.category));
}
