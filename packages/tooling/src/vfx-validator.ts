/**
 * Phase 10 — VFX Effect Definition Validator
 *
 * Validates VfxEffectDef objects against the project's art and performance
 * standards before they are used in-engine or committed to the registry.
 *
 * Rules enforced:
 *   - ids are non-empty strings containing only safe characters
 *   - triggers arrays are non-empty
 *   - particle counts, radii, distances, and lifetimes are in safe ranges
 *   - hit-flash durations are short (≤ 300 ms) to preserve readability
 *   - camera shake intensity is within comfortable range (≤ 0.05)
 *   - loot glow pulse periods are reasonable (≥ 400 ms, ≤ 5000 ms)
 *   - ambient emitter rates are bounded (≤ 30 particles/s) for performance
 *   - colour integers are 24-bit values (0x000000 – 0xffffff)
 *
 * The validator is intentionally pure-logic with no external I/O, making
 * it fast to run in CI.
 */

import type { VfxEffectDef, VfxRegistry } from '@echo-party/shared';

// ── Result Type ───────────────────────────────────────────────────────────────

export interface VfxValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const VALID_ID_RE = /^[a-z0-9_-]+$/;
const MAX_COLOR = 0xffffff;

function isValidColor(c: number): boolean {
  return Number.isInteger(c) && c >= 0 && c <= MAX_COLOR;
}

function prefix(id: string, field: string): string {
  return `Effect "${id}" — ${field}`;
}

// ── Core Validator ────────────────────────────────────────────────────────────

/**
 * Validate a single VfxEffectDef.
 *
 * @param def The effect definition to validate.
 */
export function validateVfxEffect(def: VfxEffectDef): VfxValidationResult {
  const errors: string[] = [];
  const p = (field: string) => prefix(def.id ?? '<unknown>', field);

  // id
  if (!def.id || typeof def.id !== 'string' || !VALID_ID_RE.test(def.id)) {
    errors.push(
      `Effect id "${def.id}" must be a non-empty lowercase alphanumeric/hyphen/underscore string`,
    );
  }

  // triggers
  if (!def.triggers || def.triggers.length === 0) {
    errors.push(`${p('triggers')} must contain at least one trigger`);
  }

  // particles
  if (def.particles) {
    const pt = def.particles;
    if (pt.count < 1 || pt.count > 64) {
      errors.push(`${p('particles.count')} must be 1–64 (got ${pt.count})`);
    }
    if (pt.radius < 1 || pt.radius > 16) {
      errors.push(`${p('particles.radius')} must be 1–16 px (got ${pt.radius})`);
    }
    if (pt.distance.min < 0 || pt.distance.max < pt.distance.min) {
      errors.push(`${p('particles.distance')} must satisfy 0 ≤ min ≤ max`);
    }
    if (pt.lifetimeMs.min < 50 || pt.lifetimeMs.max < pt.lifetimeMs.min) {
      errors.push(`${p('particles.lifetimeMs')} must satisfy 50 ≤ min ≤ max`);
    }
    if (pt.colors.length === 0) {
      errors.push(`${p('particles.colors')} must contain at least one colour`);
    }
    for (const c of pt.colors) {
      if (!isValidColor(c)) {
        errors.push(`${p('particles.colors')} contains invalid colour 0x${c.toString(16)}`);
      }
    }
  }

  // hitFlash
  if (def.hitFlash) {
    const hf = def.hitFlash;
    if (!isValidColor(hf.color)) {
      errors.push(`${p('hitFlash.color')} is not a valid 24-bit colour`);
    }
    if (hf.alpha < 0 || hf.alpha > 1) {
      errors.push(`${p('hitFlash.alpha')} must be 0–1 (got ${hf.alpha})`);
    }
    if (hf.durationMs <= 0 || hf.durationMs > 300) {
      errors.push(`${p('hitFlash.durationMs')} must be 1–300 ms (got ${hf.durationMs})`);
    }
  }

  // shake
  if (def.shake) {
    const sh = def.shake;
    if (sh.intensity <= 0 || sh.intensity > 0.05) {
      errors.push(`${p('shake.intensity')} must be (0, 0.05] (got ${sh.intensity})`);
    }
    if (sh.durationMs <= 0 || sh.durationMs > 1000) {
      errors.push(`${p('shake.durationMs')} must be 1–1000 ms (got ${sh.durationMs})`);
    }
  }

  // lootGlow
  if (def.lootGlow) {
    const lg = def.lootGlow;
    if (!isValidColor(lg.color)) {
      errors.push(`${p('lootGlow.color')} is not a valid 24-bit colour`);
    }
    if (lg.radius < 1 || lg.radius > 64) {
      errors.push(`${p('lootGlow.radius')} must be 1–64 px (got ${lg.radius})`);
    }
    if (lg.maxAlpha <= 0 || lg.maxAlpha > 1) {
      errors.push(`${p('lootGlow.maxAlpha')} must be (0, 1] (got ${lg.maxAlpha})`);
    }
    if (lg.pulsePeriodMs < 400 || lg.pulsePeriodMs > 5000) {
      errors.push(`${p('lootGlow.pulsePeriodMs')} must be 400–5000 ms (got ${lg.pulsePeriodMs})`);
    }
  }

  // ambient
  if (def.ambient) {
    const am = def.ambient;
    if (am.emitRatePerSecond <= 0 || am.emitRatePerSecond > 30) {
      errors.push(
        `${p('ambient.emitRatePerSecond')} must be (0, 30] (got ${am.emitRatePerSecond})`,
      );
    }
    if (am.distance.min < 0 || am.distance.max < am.distance.min) {
      errors.push(`${p('ambient.distance')} must satisfy 0 ≤ min ≤ max`);
    }
    if (am.lifetimeMs.min < 100 || am.lifetimeMs.max < am.lifetimeMs.min) {
      errors.push(`${p('ambient.lifetimeMs')} must satisfy 100 ≤ min ≤ max`);
    }
    if (am.radius < 1 || am.radius > 8) {
      errors.push(`${p('ambient.radius')} must be 1–8 px (got ${am.radius})`);
    }
    if (am.colors.length === 0) {
      errors.push(`${p('ambient.colors')} must contain at least one colour`);
    }
    for (const c of am.colors) {
      if (!isValidColor(c)) {
        errors.push(`${p('ambient.colors')} contains invalid colour 0x${c.toString(16)}`);
      }
    }
    if (am.spreadDeg < 0 || am.spreadDeg > 180) {
      errors.push(`${p('ambient.spreadDeg')} must be 0–180° (got ${am.spreadDeg})`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate every effect in a VfxRegistry.
 * Returns a map of effect id → validation result for any failed effects.
 *
 * @param registry The registry to validate.
 */
export function validateVfxRegistry(registry: VfxRegistry): Map<string, VfxValidationResult> {
  const failures = new Map<string, VfxValidationResult>();
  for (const [key, def] of Object.entries(registry)) {
    const result = validateVfxEffect(def);
    if (!result.valid) {
      failures.set(key, result);
    }
  }
  return failures;
}
