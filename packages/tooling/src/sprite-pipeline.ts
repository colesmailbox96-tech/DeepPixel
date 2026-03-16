/**
 * Phase 9 — Sprite & Icon Pipeline Utilities
 *
 * Helpers for validating sprite sheets and icon assets against the project's
 * art standards before they enter the atlas packing workflow.
 *
 * The pipeline checks:
 *   - frame dimensions match the declared SpriteSpec
 *   - icon dimensions match the IconStandard
 *   - animation frame counts are consistent with CharacterSpriteSheet defs
 *
 * These are pure-logic validators; they operate on metadata, not raw pixels,
 * so they run instantly in CI without image-processing dependencies.
 */

import type {
  SpriteSpec,
  IconStandard,
  CharacterSpriteSheet,
  AnimationDef,
} from '@echo-party/shared';

// ── Sprite Validation ─────────────────────────────────────────────────────────

export interface SpriteValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/**
 * Validate that a sprite sheet's dimensions are consistent with its spec.
 *
 * @param sheetWidth   Total image width in pixels.
 * @param sheetHeight  Total image height in pixels.
 * @param spec         Expected SpriteSpec (frame size, padding, etc.).
 * @param columns      Number of frame columns in the sheet.
 * @param rows         Number of frame rows in the sheet.
 */
export function validateSpriteSheet(
  sheetWidth: number,
  sheetHeight: number,
  spec: SpriteSpec,
  columns: number,
  rows: number,
): SpriteValidationResult {
  const errors: string[] = [];
  const expectedWidth = columns * (spec.frameWidth + spec.padding) - spec.padding;
  const expectedHeight = rows * (spec.frameHeight + spec.padding) - spec.padding;

  if (sheetWidth !== expectedWidth) {
    errors.push(
      `Sheet width ${sheetWidth}px does not match expected ${expectedWidth}px (${columns} cols × ${spec.frameWidth}px + ${columns - 1} gaps × ${spec.padding}px padding)`,
    );
  }
  if (sheetHeight !== expectedHeight) {
    errors.push(
      `Sheet height ${sheetHeight}px does not match expected ${expectedHeight}px (${rows} rows × ${spec.frameHeight}px + ${rows - 1} gaps × ${spec.padding}px padding)`,
    );
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate that animation definitions don't exceed frame count.
 */
export function validateAnimations(
  animations: readonly AnimationDef[],
  totalFrames: number,
): SpriteValidationResult {
  const errors: string[] = [];

  for (const anim of animations) {
    if (anim.startFrame < 0) {
      errors.push(`Animation "${anim.key}" has negative startFrame (${anim.startFrame})`);
    }
    if (anim.endFrame >= totalFrames) {
      errors.push(
        `Animation "${anim.key}" endFrame (${anim.endFrame}) exceeds total frames (${totalFrames})`,
      );
    }
    if (anim.endFrame < anim.startFrame) {
      errors.push(
        `Animation "${anim.key}" endFrame (${anim.endFrame}) is before startFrame (${anim.startFrame})`,
      );
    }
    if (anim.frameRate <= 0) {
      errors.push(`Animation "${anim.key}" has non-positive frameRate (${anim.frameRate})`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Full validation of a CharacterSpriteSheet definition.
 */
export function validateCharacterSheet(
  sheet: CharacterSpriteSheet,
  sheetWidth: number,
  sheetHeight: number,
  columns: number,
  rows: number,
): SpriteValidationResult {
  const dimResult = validateSpriteSheet(sheetWidth, sheetHeight, sheet.spec, columns, rows);
  const totalFrames = columns * rows;
  const animResult = validateAnimations(sheet.animations, totalFrames);

  const errors = [...dimResult.errors, ...animResult.errors];
  return { valid: errors.length === 0, errors };
}

// ── Icon Validation ───────────────────────────────────────────────────────────

/**
 * Validate that an icon image meets the IconStandard.
 */
export function validateIcon(
  iconWidth: number,
  iconHeight: number,
  standard: IconStandard,
): SpriteValidationResult {
  const errors: string[] = [];

  if (iconWidth !== standard.size) {
    errors.push(`Icon width ${iconWidth}px does not match standard ${standard.size}px`);
  }
  if (iconHeight !== standard.size) {
    errors.push(`Icon height ${iconHeight}px does not match standard ${standard.size}px`);
  }
  if (iconWidth < standard.safeZoneInset * 2 + 1) {
    errors.push(`Icon width too small for safe-zone inset of ${standard.safeZoneInset}px`);
  }

  return { valid: errors.length === 0, errors };
}
