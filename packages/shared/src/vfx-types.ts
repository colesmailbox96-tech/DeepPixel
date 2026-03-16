/**
 * Phase 10 — Runtime VFX Type Definitions
 *
 * Defines the configuration types for in-engine visual effects:
 * particle bursts, hit flashes, camera shake, loot glows, and
 * ambient atmospheric effects.
 *
 * These types are consumed by the client VFX manager and validated
 * by the tooling pipeline.
 */

// ── Blend Modes ───────────────────────────────────────────────────────────────

/** Blend mode for VFX rendering. */
export type VfxBlendMode = 'normal' | 'additive' | 'multiply';

// ── Trigger Events ────────────────────────────────────────────────────────────

/** Game events that can trigger VFX effects. */
export type VfxTrigger =
  | 'on_hit' // entity takes damage
  | 'on_kill' // entity is killed
  | 'on_loot_drop' // loot spawns on ground
  | 'on_loot_pickup' // loot picked up by player
  | 'on_room_enter' // player enters new room
  | 'on_room_clear' // all enemies defeated
  | 'ambient' // continuous background effect
  | 'boss_telegraph'; // warning before boss attack

// ── Sub-configs ───────────────────────────────────────────────────────────────

/**
 * Configuration for a procedural particle burst.
 * Particles are rendered as small circles; no texture required.
 */
export interface VfxParticleConfig {
  /** Number of particles emitted per burst. */
  readonly count: number;
  /** Particle travel distance range in screen pixels. */
  readonly distance: { readonly min: number; readonly max: number };
  /** Particle lifetime range in milliseconds. */
  readonly lifetimeMs: { readonly min: number; readonly max: number };
  /** Particle radius in screen pixels. */
  readonly radius: number;
  /** Palette of possible particle colours (hex integers, e.g. 0xffffff). */
  readonly colors: readonly number[];
  /** Blend mode for rendering these particles. */
  readonly blendMode: VfxBlendMode;
}

/** Configuration for a brief colour flash applied to an entity sprite. */
export interface VfxHitFlashConfig {
  /** Fill colour to flash (hex integer, e.g. 0xffffff for white). */
  readonly color: number;
  /** Alpha of the flash rectangle (0–1). */
  readonly alpha: number;
  /** Duration of the flash in milliseconds. */
  readonly durationMs: number;
}

/** Configuration for camera shake applied to the main camera. */
export interface VfxShakeConfig {
  /** Shake intensity in normalised units (0.001–0.05 recommended). */
  readonly intensity: number;
  /** Duration of the shake in milliseconds. */
  readonly durationMs: number;
}

/**
 * Configuration for the persistent glow ring drawn under ground loot.
 * The glow pulses in and out to draw attention.
 */
export interface VfxLootGlowConfig {
  /** Glow ring fill colour (hex integer). */
  readonly color: number;
  /** Outer radius of the glow ring in screen pixels. */
  readonly radius: number;
  /** Alpha of the glow at its peak brightness (0–1). */
  readonly maxAlpha: number;
  /** Full pulse period in milliseconds (one in-and-out cycle). */
  readonly pulsePeriodMs: number;
}

/** Configuration for a continuous ambient atmospheric particle effect. */
export interface VfxAmbientConfig {
  /** Number of particles spawned per second across the room. */
  readonly emitRatePerSecond: number;
  /** Particle travel distance range (screen pixels). */
  readonly distance: { readonly min: number; readonly max: number };
  /** Particle lifetime range (ms). */
  readonly lifetimeMs: { readonly min: number; readonly max: number };
  /** Particle radius in screen pixels. */
  readonly radius: number;
  /** Possible particle colours (hex integers). */
  readonly colors: readonly number[];
  /** Blend mode. */
  readonly blendMode: VfxBlendMode;
  /** Direction of travel in degrees (0 = right, 270 = up). */
  readonly directionDeg: number;
  /** Random spread ± around directionDeg in degrees. */
  readonly spreadDeg: number;
}

// ── Full Effect Definition ────────────────────────────────────────────────────

/**
 * A complete VFX effect definition consumed by the VFX manager.
 * Each field is optional; include only the components the effect uses.
 */
export interface VfxEffectDef {
  /** Unique string identifier used to look up the effect. */
  readonly id: string;
  /** Game events that activate this effect. */
  readonly triggers: readonly VfxTrigger[];
  /** Optional procedural particle burst component. */
  readonly particles?: VfxParticleConfig;
  /** Optional hit-flash overlay drawn on top of an entity. */
  readonly hitFlash?: VfxHitFlashConfig;
  /** Optional camera shake component. */
  readonly shake?: VfxShakeConfig;
  /** Optional persistent loot glow (used for items on the ground). */
  readonly lootGlow?: VfxLootGlowConfig;
  /** Optional continuous ambient emitter. */
  readonly ambient?: VfxAmbientConfig;
}

/** A registry of named VFX effects. */
export type VfxRegistry = Readonly<Record<string, VfxEffectDef>>;
