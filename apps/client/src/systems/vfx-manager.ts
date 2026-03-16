/**
 * Phase 10 — VFX Manager
 *
 * Orchestrates all in-engine visual effects for the 3D-feel pixel presentation.
 * Operates purely in Phaser's rendering layer; the simulation layer is untouched.
 *
 * Responsibilities:
 *   - Shadow projection (dark ellipses below entities for depth)
 *   - Hit flashes (brief colour overlays on entities)
 *   - Procedural particle bursts (circles + tweens; no textures required)
 *   - Loot glow rings (pulsing arcs around ground items)
 *   - Camera shake (forwarded to Phaser main camera)
 *   - Ambient atmospheric effects (slow floating particles per biome)
 *
 * Visual randomness (particle angles, distances, lifetimes) uses Math.random() for
 * variety. Effects are cosmetic only and do not affect gameplay or replay fidelity.
 * The manager never reads from or writes to the simulation layer.
 */

import Phaser from 'phaser';
import { TILE_SIZE, SCALE_FACTOR } from '@echo-party/shared';
import type { VfxEffectDef, VfxParticleConfig, VfxAmbientConfig } from '@echo-party/shared';
import type { GameEvent } from '@echo-party/sim';

const SCALED_TILE = TILE_SIZE * SCALE_FACTOR;

/** Shadow ellipse dimensions relative to SCALED_TILE. */
const SHADOW_RX = SCALED_TILE * 0.35;
const SHADOW_RY = SCALED_TILE * 0.12;
const SHADOW_ALPHA = 0.4;
const SHADOW_COLOR = 0x000000;

/** Depth layers for VFX objects. */
const DEPTH_SHADOW = 1;
const DEPTH_GLOW = 7;
const DEPTH_FLASH = 15;
const DEPTH_PARTICLE = 16;
const DEPTH_AMBIENT = 5;

// ── Internal State Types ───────────────────────────────────────────────────────

interface ActiveGlow {
  arc: Phaser.GameObjects.Arc;
  tween: Phaser.Tweens.Tween;
}

interface AmbientState {
  accumMs: number;
  config: VfxAmbientConfig;
  roomWidth: number;
  roomHeight: number;
  ox: number;
  oy: number;
}

// ── VfxManager ────────────────────────────────────────────────────────────────

export class VfxManager {
  private readonly scene: Phaser.Scene;

  // Persistent per-entity shadows
  private readonly shadows = new Map<string, Phaser.GameObjects.Ellipse>();

  // Persistent per-loot glow rings
  private readonly lootGlows = new Map<string, ActiveGlow>();

  // Currently active ambient state (at most one per room)
  private ambient: AmbientState | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // ── Shadow Projection ──────────────────────────────────────────────────────

  /**
   * Create or update the ground shadow ellipse for a named entity.
   * The shadow is drawn BELOW the entity rectangle to give a 3D-depth feel.
   *
   * @param id   Unique entity id (player / echo / enemy.id).
   * @param sx   Screen X centre of the entity.
   * @param sy   Screen Y centre of the entity.
   */
  syncEntityShadow(id: string, sx: number, sy: number): void {
    let ellipse = this.shadows.get(id);
    const shadowY = sy + SCALED_TILE * 0.4;

    if (!ellipse) {
      ellipse = this.scene.add.ellipse(sx, shadowY, SHADOW_RX * 2, SHADOW_RY * 2, SHADOW_COLOR);
      ellipse.setAlpha(SHADOW_ALPHA);
      ellipse.setDepth(DEPTH_SHADOW);
      this.shadows.set(id, ellipse);
    } else {
      ellipse.setPosition(sx, shadowY);
    }
  }

  /**
   * Remove the shadow for an entity (on death / room change).
   */
  removeEntityShadow(id: string): void {
    const ellipse = this.shadows.get(id);
    if (ellipse) {
      ellipse.destroy();
      this.shadows.delete(id);
    }
  }

  /**
   * Remove shadows for any entity id not present in activePositions.
   * Call this each tick after RenderSync has updated entityScreenPositions
   * so that shadows for dead/despawned entities are cleaned up promptly.
   *
   * @param activePositions The current set of live entity positions.
   */
  pruneEntityShadows(activePositions: ReadonlyMap<string, { x: number; y: number }>): void {
    const toRemove: string[] = [];
    for (const id of this.shadows.keys()) {
      if (!activePositions.has(id)) {
        toRemove.push(id);
      }
    }
    for (const id of toRemove) {
      this.removeEntityShadow(id);
    }
  }

  // ── Hit Flash ─────────────────────────────────────────────────────────────

  /**
   * Spawn a brief colour flash rectangle on top of an entity.
   *
   * @param sx       Screen X centre.
   * @param sy       Screen Y centre.
   * @param def      Effect definition supplying hitFlash config.
   */
  hitFlash(sx: number, sy: number, def: VfxEffectDef): void {
    if (!def.hitFlash) return;
    const { color, alpha, durationMs } = def.hitFlash;

    const flash = this.scene.add.rectangle(sx, sy, SCALED_TILE, SCALED_TILE, color, alpha);
    flash.setDepth(DEPTH_FLASH);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: durationMs,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });
  }

  // ── Particle Burst ────────────────────────────────────────────────────────

  /**
   * Spawn a procedural particle burst at a screen position.
   * Each particle is a small circle tweened outward and faded.
   *
   * @param sx     Screen X origin.
   * @param sy     Screen Y origin.
   * @param config Particle configuration.
   */
  particleBurst(sx: number, sy: number, config: VfxParticleConfig): void {
    for (let i = 0; i < config.count; i++) {
      const angle = (Math.PI * 2 * i) / config.count + (Math.random() - 0.5) * 1.2;
      const distance =
        config.distance.min + Math.random() * (config.distance.max - config.distance.min);
      const lifetime =
        config.lifetimeMs.min + Math.random() * (config.lifetimeMs.max - config.lifetimeMs.min);
      const color = config.colors[Math.floor(Math.random() * config.colors.length)];

      const circle = this.scene.add.circle(sx, sy, config.radius, color);
      circle.setDepth(DEPTH_PARTICLE);
      if (config.blendMode === 'additive') {
        circle.setBlendMode(Phaser.BlendModes.ADD);
      } else if (config.blendMode === 'multiply') {
        circle.setBlendMode(Phaser.BlendModes.MULTIPLY);
      }

      this.scene.tweens.add({
        targets: circle,
        x: sx + Math.cos(angle) * distance,
        y: sy + Math.sin(angle) * distance,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: lifetime,
        ease: 'Power1',
        onComplete: () => circle.destroy(),
      });
    }
  }

  // ── Camera Shake ──────────────────────────────────────────────────────────

  /**
   * Apply camera shake to the main camera.
   *
   * @param def Effect definition supplying shake config.
   */
  cameraShake(def: VfxEffectDef): void {
    if (!def.shake) return;
    this.scene.cameras.main.shake(def.shake.durationMs, def.shake.intensity);
  }

  // ── Loot Glow ─────────────────────────────────────────────────────────────

  /**
   * Add or update a pulsing glow ring beneath a loot item.
   *
   * @param key  Unique loot key (same as RenderSync's lootKey).
   * @param sx   Screen X.
   * @param sy   Screen Y.
   * @param def  Effect definition supplying lootGlow config.
   */
  addLootGlow(key: string, sx: number, sy: number, def: VfxEffectDef): void {
    if (!def.lootGlow || this.lootGlows.has(key)) return;
    const { color, radius, maxAlpha, pulsePeriodMs } = def.lootGlow;

    const arc = this.scene.add.circle(sx, sy, radius, color);
    arc.setAlpha(0);
    arc.setDepth(DEPTH_GLOW);
    arc.setBlendMode(Phaser.BlendModes.ADD);

    const tween = this.scene.tweens.add({
      targets: arc,
      alpha: { from: 0, to: maxAlpha },
      duration: pulsePeriodMs / 2,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.lootGlows.set(key, { arc, tween });
  }

  /**
   * Remove the glow ring for a loot item (e.g. on pickup / room change).
   */
  removeLootGlow(key: string): void {
    const glow = this.lootGlows.get(key);
    if (glow) {
      glow.tween.stop();
      glow.arc.destroy();
      this.lootGlows.delete(key);
    }
  }

  /**
   * Sync loot glow state with the current loot list.
   * Adds glows for new items and removes glows for picked-up items.
   *
   * @param lootKeys  Set of active loot keys (from RenderSync).
   * @param keyToDef  Map of loot key → VfxEffectDef for that item's rarity.
   * @param keyToPos  Map of loot key → screen position.
   */
  syncLootGlows(
    lootKeys: ReadonlySet<string>,
    keyToDef: ReadonlyMap<string, VfxEffectDef>,
    keyToPos: ReadonlyMap<string, { x: number; y: number }>,
  ): void {
    // Remove glows that no longer have a matching loot item
    for (const key of this.lootGlows.keys()) {
      if (!lootKeys.has(key)) {
        this.removeLootGlow(key);
      }
    }
    // Add glows for new items
    for (const key of lootKeys) {
      const def = keyToDef.get(key);
      const pos = keyToPos.get(key);
      if (def && pos) {
        this.addLootGlow(key, pos.x, pos.y, def);
      }
    }
  }

  // ── Ambient Effects ───────────────────────────────────────────────────────

  /**
   * Start emitting ambient atmospheric particles.
   * Only one ambient effect runs at a time (per room / biome).
   *
   * @param config     Ambient effect configuration.
   * @param roomWidth  Room width in tiles (for spawn distribution).
   * @param roomHeight Room height in tiles.
   * @param ox         Room screen X offset.
   * @param oy         Room screen Y offset.
   */
  startAmbient(
    config: VfxAmbientConfig,
    roomWidth: number,
    roomHeight: number,
    ox: number,
    oy: number,
  ): void {
    this.stopAmbient();
    this.ambient = { accumMs: 0, config, roomWidth, roomHeight, ox, oy };
  }

  /** Stop and discard the current ambient effect. */
  stopAmbient(): void {
    this.ambient = null;
  }

  /**
   * Update the ambient emitter.  Must be called each frame from the scene's
   * `update()` method with the frame delta in milliseconds.
   *
   * deltaMs is capped to 2 000 ms to prevent particle spikes when the tab
   * was backgrounded. Additionally, no more than 10 particles are spawned per
   * frame to keep GPU/tween pressure bounded.
   *
   * @param deltaMs Frame delta in milliseconds.
   */
  updateAmbient(deltaMs: number): void {
    if (!this.ambient) return;
    const { config, roomWidth, roomHeight, ox, oy } = this.ambient;

    // Cap to prevent particle spike after tab background / resize pause.
    const MAX_DELTA_MS = 2000;
    const MAX_SPAWNS_PER_FRAME = 10;
    this.ambient.accumMs += Math.min(deltaMs, MAX_DELTA_MS);
    const intervalMs = 1000 / config.emitRatePerSecond;

    let spawned = 0;
    while (this.ambient.accumMs >= intervalMs && spawned < MAX_SPAWNS_PER_FRAME) {
      this.ambient.accumMs -= intervalMs;
      this.spawnAmbientParticle(config, roomWidth, roomHeight, ox, oy);
      spawned++;
    }

    // Discard any remaining backlog beyond the per-frame cap.
    if (spawned >= MAX_SPAWNS_PER_FRAME) {
      this.ambient.accumMs = 0;
    }
  }

  private spawnAmbientParticle(
    config: VfxAmbientConfig,
    roomWidth: number,
    roomHeight: number,
    ox: number,
    oy: number,
  ): void {
    const sx = ox + Math.random() * roomWidth * SCALED_TILE;
    const sy = oy + Math.random() * roomHeight * SCALED_TILE;

    const dirRad =
      ((config.directionDeg + (Math.random() - 0.5) * config.spreadDeg) * Math.PI) / 180;
    const distance =
      config.distance.min + Math.random() * (config.distance.max - config.distance.min);
    const lifetime =
      config.lifetimeMs.min + Math.random() * (config.lifetimeMs.max - config.lifetimeMs.min);
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];

    const circle = this.scene.add.circle(sx, sy, config.radius, color);
    circle.setDepth(DEPTH_AMBIENT);
    circle.setAlpha(0);
    if (config.blendMode === 'additive') {
      circle.setBlendMode(Phaser.BlendModes.ADD);
    }

    this.scene.tweens.add({
      targets: circle,
      x: sx + Math.cos(dirRad) * distance,
      y: sy + Math.sin(dirRad) * distance,
      alpha: { from: 0, to: 0.6, ease: 'Sine.easeIn' },
      duration: lifetime,
      onComplete: () => circle.destroy(),
    });
  }

  // ── Event Processing ──────────────────────────────────────────────────────

  /**
   * Process a batch of GameEvents and fire the appropriate effects.
   *
   * @param events       GameEvent array from the latest sim tick.
   * @param entityPos    Screen positions keyed by entity id and 'player'/'echo'.
   * @param effectForEvt Callback mapping an event to zero or more VfxEffectDefs.
   */
  processEvents(
    events: GameEvent[],
    entityPos: ReadonlyMap<string, { x: number; y: number }>,
    effectForEvt: (evt: GameEvent) => VfxEffectDef[],
  ): void {
    for (const evt of events) {
      const defs = effectForEvt(evt);
      for (const def of defs) {
        const pos = this.resolveEventPosition(evt, entityPos);
        if (!pos) continue;

        if (def.hitFlash) this.hitFlash(pos.x, pos.y, def);
        if (def.particles) this.particleBurst(pos.x, pos.y, def.particles);
        if (def.shake) this.cameraShake(def);
      }
    }
  }

  private resolveEventPosition(
    evt: GameEvent,
    entityPos: ReadonlyMap<string, { x: number; y: number }>,
  ): { x: number; y: number } | null {
    // player_attacked: player hits an enemy → flash on the enemy (targetId)
    if (evt.type === 'player_attacked') {
      return entityPos.get(evt.targetId) ?? null;
    }
    // enemy_attacked: an enemy hits the player → flash on the player
    if (evt.type === 'enemy_attacked') {
      return entityPos.get('player') ?? null;
    }
    // echo_attacked: echo hits an enemy → flash on the targeted enemy (targetId)
    if (evt.type === 'echo_attacked') {
      return entityPos.get(evt.targetId) ?? null;
    }
    // echo_took_damage: echo takes damage from an enemy → flash on the echo
    if (evt.type === 'echo_took_damage') {
      return entityPos.get('echo') ?? null;
    }
    if (evt.type === 'room_cleared') {
      const { width, height } = this.scene.cameras.main;
      return { x: width / 2, y: height / 2 };
    }
    return null;
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────

  /** Destroy all managed VFX objects. Call when leaving a room or scene. */
  clearAll(): void {
    for (const ellipse of this.shadows.values()) ellipse.destroy();
    this.shadows.clear();

    for (const { arc, tween } of this.lootGlows.values()) {
      tween.stop();
      arc.destroy();
    }
    this.lootGlows.clear();

    this.stopAmbient();
  }
}
