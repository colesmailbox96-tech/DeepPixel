/**
 * Phase 10 — VFX Effect Registry
 *
 * All in-game VFX effect definitions for the runtime VFX manager.
 * Definitions reference colours from the established Phase 9 palettes
 * (RARITY_VISUALS, VFX_PALETTE, BIOME_PALETTES) to stay consistent with
 * the art bible.
 *
 * Palette colours in this file are expressed as Phaser-compatible hex
 * integers (0xRRGGBB) derived from the 6-char strings in palettes.ts.
 */

import type { VfxEffectDef, VfxRegistry } from '@echo-party/shared';

// ── Combat Effects ────────────────────────────────────────────────────────────

/** White hit-flash + particle burst fired when the player attacks an enemy. */
const EFFECT_PLAYER_HIT: VfxEffectDef = {
  id: 'player_hit',
  triggers: ['on_hit'],
  hitFlash: {
    color: 0xffffff,
    alpha: 0.85,
    durationMs: 100,
  },
  particles: {
    count: 6,
    distance: { min: 12, max: 28 },
    lifetimeMs: { min: 250, max: 450 },
    radius: 2,
    colors: [0xffffff, 0xffee88, 0xff8844],
    blendMode: 'additive',
  },
};

/** Red hit-flash fired when the player takes damage. */
const EFFECT_ENEMY_HIT: VfxEffectDef = {
  id: 'enemy_hit',
  triggers: ['on_hit'],
  hitFlash: {
    color: 0xff2222,
    alpha: 0.7,
    durationMs: 120,
  },
  shake: {
    intensity: 0.004,
    durationMs: 80,
  },
};

/** Echo companion hit — golden flash distinguishes the echo from the player. */
const EFFECT_ECHO_HIT: VfxEffectDef = {
  id: 'echo_hit',
  triggers: ['on_hit'],
  hitFlash: {
    color: 0xffcc44,
    alpha: 0.7,
    durationMs: 100,
  },
};

/** Burst of particles when an enemy is killed. */
const EFFECT_ENEMY_KILL: VfxEffectDef = {
  id: 'enemy_kill',
  triggers: ['on_kill'],
  particles: {
    count: 10,
    distance: { min: 18, max: 40 },
    lifetimeMs: { min: 300, max: 600 },
    radius: 3,
    colors: [0xffffff, 0xff8844, 0xffee44, 0xff4444],
    blendMode: 'additive',
  },
  shake: {
    intensity: 0.003,
    durationMs: 60,
  },
};

// ── Loot Effects ──────────────────────────────────────────────────────────────

/** Common loot — no visible glow. */
const EFFECT_LOOT_COMMON: VfxEffectDef = {
  id: 'loot_common',
  triggers: ['on_loot_drop'],
};

/** Uncommon loot — subtle green glow. */
const EFFECT_LOOT_UNCOMMON: VfxEffectDef = {
  id: 'loot_uncommon',
  triggers: ['on_loot_drop'],
  lootGlow: {
    color: 0x44aa44,
    radius: 10,
    maxAlpha: 0.35,
    pulsePeriodMs: 2000,
  },
};

/** Rare loot — blue glow, moderate pulse. */
const EFFECT_LOOT_RARE: VfxEffectDef = {
  id: 'loot_rare',
  triggers: ['on_loot_drop'],
  lootGlow: {
    color: 0x4488cc,
    radius: 13,
    maxAlpha: 0.5,
    pulsePeriodMs: 1600,
  },
};

/** Epic loot — purple glow, faster pulse. */
const EFFECT_LOOT_EPIC: VfxEffectDef = {
  id: 'loot_epic',
  triggers: ['on_loot_drop'],
  lootGlow: {
    color: 0x9944cc,
    radius: 16,
    maxAlpha: 0.65,
    pulsePeriodMs: 1200,
  },
};

/** Legendary loot — gold glow, bright and fast. */
const EFFECT_LOOT_LEGENDARY: VfxEffectDef = {
  id: 'loot_legendary',
  triggers: ['on_loot_drop'],
  lootGlow: {
    color: 0xffcc00,
    radius: 20,
    maxAlpha: 0.8,
    pulsePeriodMs: 800,
  },
  particles: {
    count: 4,
    distance: { min: 8, max: 18 },
    lifetimeMs: { min: 600, max: 1000 },
    radius: 2,
    colors: [0xffcc00, 0xffee88, 0xffffff],
    blendMode: 'additive',
  },
};

// ── Pickup Effects ────────────────────────────────────────────────────────────

/** Sparkle burst when loot is picked up. */
const EFFECT_LOOT_PICKUP: VfxEffectDef = {
  id: 'loot_pickup',
  triggers: ['on_loot_pickup'],
  particles: {
    count: 8,
    distance: { min: 10, max: 24 },
    lifetimeMs: { min: 200, max: 400 },
    radius: 2,
    colors: [0xffee88, 0xffffff, 0xffcc44],
    blendMode: 'additive',
  },
};

// ── Room Events ───────────────────────────────────────────────────────────────

/** Flash + shake burst when all enemies in a room are cleared. */
const EFFECT_ROOM_CLEAR: VfxEffectDef = {
  id: 'room_clear',
  triggers: ['on_room_clear'],
  particles: {
    count: 16,
    distance: { min: 30, max: 70 },
    lifetimeMs: { min: 400, max: 800 },
    radius: 3,
    colors: [0x44ff88, 0x88ffcc, 0xffffff],
    blendMode: 'additive',
  },
  shake: {
    intensity: 0.005,
    durationMs: 120,
  },
};

// ── Ambient Effects ───────────────────────────────────────────────────────────

/** Sewer — rising damp bubbles / mist. */
const AMBIENT_SEWER: VfxEffectDef = {
  id: 'ambient_sewer',
  triggers: ['ambient'],
  ambient: {
    emitRatePerSecond: 3,
    distance: { min: 20, max: 50 },
    lifetimeMs: { min: 1200, max: 2400 },
    radius: 2,
    colors: [0x3a5a40, 0x5a7a50, 0x8aaa60],
    blendMode: 'normal',
    directionDeg: 270,
    spreadDeg: 25,
  },
};

/** Crypt — drifting ash / dust. */
const AMBIENT_CRYPT: VfxEffectDef = {
  id: 'ambient_crypt',
  triggers: ['ambient'],
  ambient: {
    emitRatePerSecond: 2,
    distance: { min: 15, max: 40 },
    lifetimeMs: { min: 1500, max: 3000 },
    radius: 1,
    colors: [0x7a7a8e, 0xb0b0c4, 0xffffff],
    blendMode: 'additive',
    directionDeg: 285,
    spreadDeg: 40,
  },
};

/** Volcano — rising embers. */
const AMBIENT_VOLCANO: VfxEffectDef = {
  id: 'ambient_volcano',
  triggers: ['ambient'],
  ambient: {
    emitRatePerSecond: 5,
    distance: { min: 25, max: 60 },
    lifetimeMs: { min: 800, max: 2000 },
    radius: 2,
    colors: [0xee7744, 0xffcc44, 0xff4400],
    blendMode: 'additive',
    directionDeg: 270,
    spreadDeg: 20,
  },
};

/** Ice Cave — swirling snowflakes. */
const AMBIENT_ICE_CAVE: VfxEffectDef = {
  id: 'ambient_ice_cave',
  triggers: ['ambient'],
  ambient: {
    emitRatePerSecond: 4,
    distance: { min: 20, max: 45 },
    lifetimeMs: { min: 1000, max: 2500 },
    radius: 1,
    colors: [0xaaddee, 0xeeffff, 0xffffff],
    blendMode: 'additive',
    directionDeg: 255,
    spreadDeg: 35,
  },
};

/** Forest — drifting pollen / leaves. */
const AMBIENT_FOREST: VfxEffectDef = {
  id: 'ambient_forest',
  triggers: ['ambient'],
  ambient: {
    emitRatePerSecond: 3,
    distance: { min: 18, max: 45 },
    lifetimeMs: { min: 1200, max: 2800 },
    radius: 2,
    colors: [0x8ec07c, 0xc4e8a0, 0xffffff],
    blendMode: 'normal',
    directionDeg: 260,
    spreadDeg: 30,
  },
};

/** Ruins — drifting rubble dust. */
const AMBIENT_RUINS: VfxEffectDef = {
  id: 'ambient_ruins',
  triggers: ['ambient'],
  ambient: {
    emitRatePerSecond: 2,
    distance: { min: 15, max: 35 },
    lifetimeMs: { min: 1500, max: 3500 },
    radius: 1,
    colors: [0x8a7a60, 0xbaa880, 0xeed8a0],
    blendMode: 'normal',
    directionDeg: 275,
    spreadDeg: 45,
  },
};

// ── Registry ──────────────────────────────────────────────────────────────────

/**
 * Complete registry of all VFX effects.
 * Keys match the `id` field of each VfxEffectDef.
 */
export const VFX_EFFECTS: VfxRegistry = {
  [EFFECT_PLAYER_HIT.id]: EFFECT_PLAYER_HIT,
  [EFFECT_ENEMY_HIT.id]: EFFECT_ENEMY_HIT,
  [EFFECT_ECHO_HIT.id]: EFFECT_ECHO_HIT,
  [EFFECT_ENEMY_KILL.id]: EFFECT_ENEMY_KILL,
  [EFFECT_LOOT_COMMON.id]: EFFECT_LOOT_COMMON,
  [EFFECT_LOOT_UNCOMMON.id]: EFFECT_LOOT_UNCOMMON,
  [EFFECT_LOOT_RARE.id]: EFFECT_LOOT_RARE,
  [EFFECT_LOOT_EPIC.id]: EFFECT_LOOT_EPIC,
  [EFFECT_LOOT_LEGENDARY.id]: EFFECT_LOOT_LEGENDARY,
  [EFFECT_LOOT_PICKUP.id]: EFFECT_LOOT_PICKUP,
  [EFFECT_ROOM_CLEAR.id]: EFFECT_ROOM_CLEAR,
  [AMBIENT_SEWER.id]: AMBIENT_SEWER,
  [AMBIENT_CRYPT.id]: AMBIENT_CRYPT,
  [AMBIENT_VOLCANO.id]: AMBIENT_VOLCANO,
  [AMBIENT_ICE_CAVE.id]: AMBIENT_ICE_CAVE,
  [AMBIENT_FOREST.id]: AMBIENT_FOREST,
  [AMBIENT_RUINS.id]: AMBIENT_RUINS,
};
