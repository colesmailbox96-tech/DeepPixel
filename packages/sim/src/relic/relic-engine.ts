import type { RelicDef, RelicId, StatBlock } from '@echo-party/shared';
import { SeededRng } from '../rng';

/**
 * Runtime relic state held during a run.
 * Each picked-up relic is added to `held`.
 */
export interface RelicState {
  /** Relics the player is currently carrying */
  held: RelicDef[];
}

/** Create an empty relic state at the start of a run */
export function createRelicState(): RelicState {
  return { held: [] };
}

/** Add a relic to the player's collection */
export function addRelic(state: RelicState, relic: RelicDef): void {
  state.held.push(relic);
}

/** Check whether the player already owns a relic */
export function hasRelic(state: RelicState, id: RelicId): boolean {
  return state.held.some((r) => r.id === id);
}

// ── Effect helpers ───────────────────────────────────────────────────────────

/**
 * Compute total passive damage reduction from all held relics.
 */
export function passiveDamageReduction(state: RelicState): number {
  return state.held
    .filter((r) => r.trigger === 'passive' && r.effect === 'damage_reduction')
    .reduce((sum, r) => sum + r.magnitude, 0);
}

/**
 * Compute total passive bonus speed from all held relics.
 */
export function passiveBonusSpeed(state: RelicState): number {
  return state.held
    .filter((r) => r.trigger === 'passive' && r.effect === 'bonus_speed')
    .reduce((sum, r) => sum + r.magnitude, 0);
}

/**
 * Compute bonus damage from on_hit relics (flat bonus + crit).
 * Returns total extra damage for a single attack.
 */
export function onHitBonusDamage(state: RelicState, baseDamage: number, rng: SeededRng): number {
  let bonus = 0;

  for (const relic of state.held) {
    if (relic.trigger !== 'on_hit') continue;

    switch (relic.effect) {
      case 'bonus_damage':
        bonus += relic.magnitude;
        break;
      case 'crit_chance':
        if (rng.next() < relic.magnitude) {
          bonus += baseDamage; // double damage on crit
        }
        break;
      case 'lifesteal':
        // handled separately after damage application
        break;
    }
  }

  return bonus;
}

/**
 * Compute total lifesteal healing after an attack.
 */
export function onHitLifesteal(state: RelicState, damageDealt: number): number {
  let heal = 0;
  for (const relic of state.held) {
    if (relic.trigger === 'on_hit' && relic.effect === 'lifesteal') {
      heal += Math.floor(damageDealt * relic.magnitude);
    }
  }
  return heal;
}

/**
 * Compute on-kill effects. Returns { heal, bonusCoins }.
 */
export function onKillEffects(state: RelicState): { heal: number; bonusCoins: number } {
  let heal = 0;
  let bonusCoins = 0;
  for (const relic of state.held) {
    if (relic.trigger !== 'on_kill') continue;
    if (relic.effect === 'heal') heal += relic.magnitude;
    if (relic.effect === 'bonus_coins') bonusCoins += relic.magnitude;
  }
  return { heal, bonusCoins };
}

/**
 * Compute thorns damage returned when the player takes a hit.
 */
export function thornsDamage(state: RelicState): number {
  return state.held
    .filter((r) => r.trigger === 'on_take_damage' && r.effect === 'thorns')
    .reduce((sum, r) => sum + r.magnitude, 0);
}

/**
 * Compute on_room_clear effects. Returns heal amount.
 */
export function onRoomClearEffects(state: RelicState): { heal: number } {
  let heal = 0;
  for (const relic of state.held) {
    if (relic.trigger === 'on_room_clear' && relic.effect === 'heal') {
      heal += relic.magnitude;
    }
  }
  return { heal };
}

/**
 * Compute on_room_enter effects. Returns heal amount.
 */
export function onRoomEnterEffects(state: RelicState): { heal: number } {
  let heal = 0;
  for (const relic of state.held) {
    if (relic.trigger === 'on_room_enter' && relic.effect === 'heal') {
      heal += relic.magnitude;
    }
  }
  return { heal };
}

/**
 * Compute total passive loot luck bonus (additive fraction, e.g. 0.2 = +20%).
 */
export function passiveLootLuck(state: RelicState): number {
  return state.held
    .filter((r) => r.trigger === 'passive' && r.effect === 'loot_luck')
    .reduce((sum, r) => sum + r.magnitude, 0);
}

/**
 * Compute total passive bonus coin multiplier (additive fraction).
 */
export function passiveBonusCoinScale(state: RelicState): number {
  return state.held
    .filter((r) => r.trigger === 'passive' && r.effect === 'bonus_coins')
    .reduce((sum, r) => sum + r.magnitude, 0);
}

/**
 * Apply a flat HP heal to a stat block, respecting maxHp.
 */
export function applyHeal(player: StatBlock, amount: number): void {
  player.currentHp = Math.min(player.maxHp, player.currentHp + amount);
}
