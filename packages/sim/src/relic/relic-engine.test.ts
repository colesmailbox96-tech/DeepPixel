import { describe, it, expect } from 'vitest';
import { Rarity } from '@echo-party/shared';
import type { RelicDef, StatBlock } from '@echo-party/shared';
import { SeededRng } from '../rng';
import {
  createRelicState,
  addRelic,
  hasRelic,
  passiveDamageReduction,
  passiveBonusSpeed,
  onHitBonusDamage,
  onHitLifesteal,
  onKillEffects,
  thornsDamage,
  onRoomClearEffects,
  onRoomEnterEffects,
  passiveLootLuck,
  passiveBonusCoinScale,
  applyHeal,
} from './relic-engine';

const THORN_RING: RelicDef = {
  id: 'relic-thorn-ring',
  name: 'Thorn Ring',
  description: 'Reflect 2 damage when hit.',
  rarity: Rarity.Common,
  trigger: 'on_take_damage',
  effect: 'thorns',
  magnitude: 2,
};

const IRON_SKIN: RelicDef = {
  id: 'relic-iron-skin',
  name: 'Iron Skin',
  description: 'Reduce all incoming damage by 1.',
  rarity: Rarity.Common,
  trigger: 'passive',
  effect: 'damage_reduction',
  magnitude: 1,
};

const VAMPIRIC_FANG: RelicDef = {
  id: 'relic-vampiric-fang',
  name: 'Vampiric Fang',
  description: 'Heal 2 HP on each kill.',
  rarity: Rarity.Uncommon,
  trigger: 'on_kill',
  effect: 'heal',
  magnitude: 2,
};

const POWER_GAUNTLET: RelicDef = {
  id: 'relic-power-gauntlet',
  name: 'Power Gauntlet',
  description: 'Deal 2 bonus damage on hit.',
  rarity: Rarity.Uncommon,
  trigger: 'on_hit',
  effect: 'bonus_damage',
  magnitude: 2,
};

const CRIT_LENS: RelicDef = {
  id: 'relic-crit-lens',
  name: 'Critical Lens',
  description: '15% chance to deal double damage.',
  rarity: Rarity.Uncommon,
  trigger: 'on_hit',
  effect: 'crit_chance',
  magnitude: 0.15,
};

const LIFESTEAL_BLADE: RelicDef = {
  id: 'relic-lifesteal-blade',
  name: 'Lifesteal Blade',
  description: 'Heal for 25% of damage dealt.',
  rarity: Rarity.Epic,
  trigger: 'on_hit',
  effect: 'lifesteal',
  magnitude: 0.25,
};

const LUCKY_COIN: RelicDef = {
  id: 'relic-lucky-coin',
  name: 'Lucky Coin',
  description: 'Earn 1 bonus coin per kill.',
  rarity: Rarity.Common,
  trigger: 'on_kill',
  effect: 'bonus_coins',
  magnitude: 1,
};

const SWIFT_BOOTS: RelicDef = {
  id: 'relic-swift-boots',
  name: 'Swift Boots',
  description: 'Gain +1 speed.',
  rarity: Rarity.Common,
  trigger: 'passive',
  effect: 'bonus_speed',
  magnitude: 1,
};

const TREASURE_MAP: RelicDef = {
  id: 'relic-treasure-map',
  name: 'Treasure Map',
  description: 'Increase loot drop chance by 20%.',
  rarity: Rarity.Uncommon,
  trigger: 'passive',
  effect: 'loot_luck',
  magnitude: 0.2,
};

const PHOENIX_FEATHER: RelicDef = {
  id: 'relic-phoenix-feather',
  name: 'Phoenix Feather',
  description: 'Heal 10 HP when a room is cleared.',
  rarity: Rarity.Legendary,
  trigger: 'on_room_clear',
  effect: 'heal',
  magnitude: 10,
};

const SANCTUARY_BELL: RelicDef = {
  id: 'relic-room-heal',
  name: 'Sanctuary Bell',
  description: 'Heal 5 HP when entering a new room.',
  rarity: Rarity.Rare,
  trigger: 'on_room_enter',
  effect: 'heal',
  magnitude: 5,
};

const GOLD_MAGNET: RelicDef = {
  id: 'relic-gold-magnet',
  name: 'Gold Magnet',
  description: 'Earn 50% more coins.',
  rarity: Rarity.Uncommon,
  trigger: 'passive',
  effect: 'bonus_coins',
  magnitude: 0.5,
};

// ─── State management ─────────────────────────────────────────────────────────

describe('relic state management', () => {
  it('starts with no relics', () => {
    const state = createRelicState();
    expect(state.held).toHaveLength(0);
  });

  it('addRelic adds a relic to held', () => {
    const state = createRelicState();
    addRelic(state, THORN_RING);
    expect(state.held).toHaveLength(1);
    expect(state.held[0].id).toBe('relic-thorn-ring');
  });

  it('hasRelic returns true for held relics', () => {
    const state = createRelicState();
    expect(hasRelic(state, 'relic-thorn-ring')).toBe(false);
    addRelic(state, THORN_RING);
    expect(hasRelic(state, 'relic-thorn-ring')).toBe(true);
  });

  it('supports holding multiple relics', () => {
    const state = createRelicState();
    addRelic(state, THORN_RING);
    addRelic(state, IRON_SKIN);
    addRelic(state, VAMPIRIC_FANG);
    expect(state.held).toHaveLength(3);
  });
});

// ─── Passive effects ──────────────────────────────────────────────────────────

describe('passive relic effects', () => {
  it('passiveDamageReduction sums all damage_reduction relics', () => {
    const state = createRelicState();
    expect(passiveDamageReduction(state)).toBe(0);
    addRelic(state, IRON_SKIN);
    expect(passiveDamageReduction(state)).toBe(1);
  });

  it('passiveBonusSpeed sums all bonus_speed relics', () => {
    const state = createRelicState();
    expect(passiveBonusSpeed(state)).toBe(0);
    addRelic(state, SWIFT_BOOTS);
    expect(passiveBonusSpeed(state)).toBe(1);
  });

  it('passiveLootLuck sums all loot_luck relics', () => {
    const state = createRelicState();
    expect(passiveLootLuck(state)).toBe(0);
    addRelic(state, TREASURE_MAP);
    expect(passiveLootLuck(state)).toBeCloseTo(0.2);
  });

  it('passiveBonusCoinScale sums all passive bonus_coins relics', () => {
    const state = createRelicState();
    expect(passiveBonusCoinScale(state)).toBe(0);
    addRelic(state, GOLD_MAGNET);
    expect(passiveBonusCoinScale(state)).toBeCloseTo(0.5);
  });
});

// ─── On-hit effects ───────────────────────────────────────────────────────────

describe('on-hit relic effects', () => {
  it('onHitBonusDamage adds flat bonus from bonus_damage relics', () => {
    const state = createRelicState();
    const rng = new SeededRng('test');
    addRelic(state, POWER_GAUNTLET);
    const bonus = onHitBonusDamage(state, 10, rng);
    expect(bonus).toBeGreaterThanOrEqual(2); // at least the flat bonus
  });

  it('onHitBonusDamage may include crit', () => {
    const state = createRelicState();
    addRelic(state, CRIT_LENS);
    // Run many times to verify crit can fire
    let critted = false;
    for (let i = 0; i < 100; i++) {
      const rng = new SeededRng(`crit-${i}`);
      const bonus = onHitBonusDamage(state, 10, rng);
      if (bonus > 0) critted = true;
    }
    expect(critted).toBe(true);
  });

  it('onHitLifesteal returns heal proportional to damage', () => {
    const state = createRelicState();
    expect(onHitLifesteal(state, 20)).toBe(0);
    addRelic(state, LIFESTEAL_BLADE);
    expect(onHitLifesteal(state, 20)).toBe(5); // floor(20 * 0.25)
  });
});

// ─── On-kill effects ──────────────────────────────────────────────────────────

describe('on-kill relic effects', () => {
  it('returns heal and bonus coins from on_kill relics', () => {
    const state = createRelicState();
    addRelic(state, VAMPIRIC_FANG);
    addRelic(state, LUCKY_COIN);
    const result = onKillEffects(state);
    expect(result.heal).toBe(2);
    expect(result.bonusCoins).toBe(1);
  });

  it('returns zero when no on_kill relics held', () => {
    const state = createRelicState();
    const result = onKillEffects(state);
    expect(result.heal).toBe(0);
    expect(result.bonusCoins).toBe(0);
  });
});

// ─── Thorns ───────────────────────────────────────────────────────────────────

describe('thorns effect', () => {
  it('returns thorns damage from on_take_damage relics', () => {
    const state = createRelicState();
    expect(thornsDamage(state)).toBe(0);
    addRelic(state, THORN_RING);
    expect(thornsDamage(state)).toBe(2);
  });
});

// ─── Room-based effects ───────────────────────────────────────────────────────

describe('room-based relic effects', () => {
  it('onRoomClearEffects returns heal from on_room_clear relics', () => {
    const state = createRelicState();
    expect(onRoomClearEffects(state).heal).toBe(0);
    addRelic(state, PHOENIX_FEATHER);
    expect(onRoomClearEffects(state).heal).toBe(10);
  });

  it('onRoomEnterEffects returns heal from on_room_enter relics', () => {
    const state = createRelicState();
    expect(onRoomEnterEffects(state).heal).toBe(0);
    addRelic(state, SANCTUARY_BELL);
    expect(onRoomEnterEffects(state).heal).toBe(5);
  });
});

// ─── applyHeal ────────────────────────────────────────────────────────────────

describe('applyHeal', () => {
  it('heals without exceeding maxHp', () => {
    const player: StatBlock = { maxHp: 100, currentHp: 80, attack: 10, defense: 5, speed: 3 };
    applyHeal(player, 10);
    expect(player.currentHp).toBe(90);
  });

  it('caps at maxHp', () => {
    const player: StatBlock = { maxHp: 100, currentHp: 95, attack: 10, defense: 5, speed: 3 };
    applyHeal(player, 20);
    expect(player.currentHp).toBe(100);
  });
});
