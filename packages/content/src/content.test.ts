import { describe, it, expect } from 'vitest';
import { Rarity, Biome, Difficulty } from '@echo-party/shared';
import { ENEMY_DEFS, ELITE_ENEMY_DEFS, ALL_ENEMY_DEFS } from './enemies';
import { RELIC_DEFS, findRelic } from './relics';
import { BIOME_RULES } from './biomes';
import { CONTRACTS } from './contracts';
import { CONTRACT_MODIFIERS } from './contract-modifiers';
import {
  DEFAULT_LOOT_TABLE,
  ELITE_LOOT_TABLE,
  RARE_LOOT_TABLE,
  ROOM_CLEAR_LOOT_TABLE,
  ICE_CAVE_LOOT_TABLE,
  RUINS_LOOT_TABLE,
} from './loot-tables';
import { RARITY_BASE_WEIGHTS, BIOME_RELIC_SOURCES, RARITY_BIOME_FOCUS } from './balance';

// ── Enemies ───────────────────────────────────────────────────────────────────

describe('ENEMY_DEFS', () => {
  it('contains at least 15 archetypes', () => {
    expect(Object.keys(ENEMY_DEFS).length).toBeGreaterThanOrEqual(15);
  });

  it('includes Phase 8 archetypes: troll, witch, bat, golem, serpent', () => {
    expect(ENEMY_DEFS.troll).toBeDefined();
    expect(ENEMY_DEFS.witch).toBeDefined();
    expect(ENEMY_DEFS.bat).toBeDefined();
    expect(ENEMY_DEFS.golem).toBeDefined();
    expect(ENEMY_DEFS.serpent).toBeDefined();
  });

  it('each enemy def has valid stats', () => {
    for (const def of Object.values(ENEMY_DEFS)) {
      expect(def.stats.maxHp).toBeGreaterThan(0);
      expect(def.stats.currentHp).toBe(def.stats.maxHp);
      expect(def.stats.attack).toBeGreaterThan(0);
      expect(def.stats.speed).toBeGreaterThan(0);
    }
  });

  it('ALL_ENEMY_DEFS matches ENEMY_DEFS count', () => {
    expect(ALL_ENEMY_DEFS.length).toBe(Object.keys(ENEMY_DEFS).length);
  });
});

describe('ELITE_ENEMY_DEFS', () => {
  it('contains at least 8 elite variants', () => {
    expect(ELITE_ENEMY_DEFS.length).toBeGreaterThanOrEqual(8);
  });

  it('includes Phase 8 elites: Frost Troll, Elder Witch, Serpent Lord', () => {
    const names = ELITE_ENEMY_DEFS.map((e) => e.name);
    expect(names).toContain('Frost Troll');
    expect(names).toContain('Elder Witch');
    expect(names).toContain('Serpent Lord');
  });

  it('all elites have isElite = true', () => {
    for (const elite of ELITE_ENEMY_DEFS) {
      expect(elite.isElite).toBe(true);
    }
  });

  it('elites are stat-boosted over their base counterparts', () => {
    const troll = ENEMY_DEFS.troll;
    const frostTroll = ELITE_ENEMY_DEFS.find((e) => e.name === 'Frost Troll')!;
    expect(frostTroll.stats.maxHp).toBeGreaterThan(troll.stats.maxHp);
    expect(frostTroll.stats.attack).toBeGreaterThan(troll.stats.attack);
  });
});

// ── Biomes ────────────────────────────────────────────────────────────────────

describe('BIOME_RULES', () => {
  it('covers all Biome enum values', () => {
    const biomeValues = Object.values(Biome);
    for (const biome of biomeValues) {
      expect(BIOME_RULES[biome]).toBeDefined();
    }
  });

  it('includes Phase 8 biomes: IceCave and Ruins', () => {
    expect(BIOME_RULES[Biome.IceCave]).toBeDefined();
    expect(BIOME_RULES[Biome.Ruins]).toBeDefined();
  });

  it('IceCave biome uses Phase 8 enemies as preferred', () => {
    const { preferredEnemies } = BIOME_RULES[Biome.IceCave];
    expect(preferredEnemies).toContain('troll');
    expect(preferredEnemies).toContain('bat');
  });

  it('Ruins biome uses Phase 8 enemies as preferred', () => {
    const { preferredEnemies } = BIOME_RULES[Biome.Ruins];
    expect(preferredEnemies).toContain('golem');
    expect(preferredEnemies).toContain('witch');
  });

  it('all biomes have valid obstacle ranges', () => {
    for (const rules of Object.values(BIOME_RULES)) {
      expect(rules.minObstacles).toBeGreaterThanOrEqual(0);
      expect(rules.maxObstacles).toBeGreaterThanOrEqual(rules.minObstacles);
    }
  });
});

// ── Relics ────────────────────────────────────────────────────────────────────

describe('RELIC_DEFS', () => {
  it('contains at least 24 relics', () => {
    expect(RELIC_DEFS.length).toBeGreaterThanOrEqual(24);
  });

  it('includes Phase 8 relics', () => {
    const ids = RELIC_DEFS.map((r) => r.id);
    expect(ids).toContain('relic-stone-amulet');
    expect(ids).toContain('relic-battle-drum');
    expect(ids).toContain('relic-mana-shard');
    expect(ids).toContain('relic-bounty-coin');
    expect(ids).toContain('relic-thorned-armor');
    expect(ids).toContain('relic-serpent-fang');
    expect(ids).toContain('relic-doom-sigil');
    expect(ids).toContain('relic-void-heart');
  });

  it('has at least one relic per rarity tier', () => {
    const rarities = new Set(RELIC_DEFS.map((r) => r.rarity));
    expect(rarities.has(Rarity.Common)).toBe(true);
    expect(rarities.has(Rarity.Uncommon)).toBe(true);
    expect(rarities.has(Rarity.Rare)).toBe(true);
    expect(rarities.has(Rarity.Epic)).toBe(true);
    expect(rarities.has(Rarity.Legendary)).toBe(true);
  });

  it('all relic IDs are unique', () => {
    const ids = RELIC_DEFS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('relic-battle-drum is passive with bonus_speed (engine-supported)', () => {
    const relic = findRelic('relic-battle-drum')!;
    expect(relic.trigger).toBe('passive');
    expect(relic.effect).toBe('bonus_speed');
  });

  it('relic-void-heart is on_hit with bonus_damage (engine-supported)', () => {
    const relic = findRelic('relic-void-heart')!;
    expect(relic.trigger).toBe('on_hit');
    expect(relic.effect).toBe('bonus_damage');
  });

  it('findRelic returns relic by ID', () => {
    const relic = findRelic('relic-void-heart');
    expect(relic).toBeDefined();
    expect(relic?.name).toBe('Void Heart');
    expect(relic?.rarity).toBe(Rarity.Legendary);
  });

  it('findRelic returns undefined for unknown ID', () => {
    expect(findRelic('relic-does-not-exist')).toBeUndefined();
  });
});

// ── Contract Modifiers ────────────────────────────────────────────────────────

describe('CONTRACT_MODIFIERS', () => {
  it('contains at least 11 modifiers', () => {
    expect(Object.keys(CONTRACT_MODIFIERS).length).toBeGreaterThanOrEqual(11);
  });

  it('includes Phase 8 modifiers', () => {
    expect(CONTRACT_MODIFIERS['mod-cursed']).toBeDefined();
    expect(CONTRACT_MODIFIERS['mod-glass-cannon']).toBeDefined();
    expect(CONTRACT_MODIFIERS['mod-elite-tide']).toBeDefined();
    expect(CONTRACT_MODIFIERS['mod-rich-ruins']).toBeDefined();
  });

  it('mod-cursed scales HP and attack', () => {
    const mod = CONTRACT_MODIFIERS['mod-cursed'];
    expect(mod.enemyHpScale).toBeGreaterThan(1);
    expect(mod.enemyAtkScale).toBeGreaterThan(1);
  });

  it('mod-glass-cannon reduces HP and increases attack', () => {
    const mod = CONTRACT_MODIFIERS['mod-glass-cannon'];
    expect(mod.enemyHpScale).toBeLessThan(1);
    expect(mod.enemyAtkScale).toBeGreaterThan(1);
  });

  it('mod-elite-tide has boostedElites and extra rooms', () => {
    const mod = CONTRACT_MODIFIERS['mod-elite-tide'];
    expect(mod.boostedElites).toBe(true);
    expect(mod.extraRooms).toBeGreaterThan(0);
  });
});

// ── Contracts ─────────────────────────────────────────────────────────────────

describe('CONTRACTS', () => {
  it('contains at least 13 contracts', () => {
    expect(CONTRACTS.length).toBeGreaterThanOrEqual(13);
  });

  it('includes Phase 8 contracts', () => {
    const ids = CONTRACTS.map((c) => c.id);
    expect(ids).toContain('contract-ice-cave-delve');
    expect(ids).toContain('contract-ruined-temple');
    expect(ids).toContain('contract-cursed-crypts');
    expect(ids).toContain('contract-glass-dungeon');
    expect(ids).toContain('contract-endless-siege');
  });

  it('contract-ice-cave-delve uses IceCave biome', () => {
    const contract = CONTRACTS.find((c) => c.id === 'contract-ice-cave-delve')!;
    expect(contract.biome).toBe(Biome.IceCave);
  });

  it('contract-ruined-temple uses Ruins biome and MOD_RICH_RUINS', () => {
    const contract = CONTRACTS.find((c) => c.id === 'contract-ruined-temple')!;
    expect(contract.biome).toBe(Biome.Ruins);
    expect(contract.modifiers?.some((m) => m.id === 'mod-rich-ruins')).toBe(true);
  });

  it('contract-endless-siege is Nightmare with 8 rooms', () => {
    const contract = CONTRACTS.find((c) => c.id === 'contract-endless-siege')!;
    expect(contract.difficulty).toBe(Difficulty.Nightmare);
    expect(contract.roomCount).toBe(8);
  });

  it('all contracts have unique IDs', () => {
    const ids = CONTRACTS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('Phase 2 originals still exist', () => {
    const ids = CONTRACTS.map((c) => c.id);
    expect(ids).toContain('contract-sewer-sweep');
    expect(ids).toContain('contract-goblin-raid');
    expect(ids).toContain('contract-dark-depths');
  });
});

// ── Loot Tables ───────────────────────────────────────────────────────────────

describe('loot tables', () => {
  it('all existing tables are non-empty', () => {
    expect(DEFAULT_LOOT_TABLE.length).toBeGreaterThan(0);
    expect(ELITE_LOOT_TABLE.length).toBeGreaterThan(0);
    expect(RARE_LOOT_TABLE.length).toBeGreaterThan(0);
    expect(ROOM_CLEAR_LOOT_TABLE.length).toBeGreaterThan(0);
  });

  it('ICE_CAVE_LOOT_TABLE is defined and non-empty', () => {
    expect(ICE_CAVE_LOOT_TABLE.length).toBeGreaterThan(0);
  });

  it('RUINS_LOOT_TABLE is defined and non-empty', () => {
    expect(RUINS_LOOT_TABLE.length).toBeGreaterThan(0);
  });

  it('RUINS_LOOT_TABLE contains an Epic relic drop', () => {
    const epicEntry = RUINS_LOOT_TABLE.find((e) => e.rarity === Rarity.Epic);
    expect(epicEntry).toBeDefined();
    expect(epicEntry?.kind).toBe('relic');
  });

  it('all loot entries have positive weight and non-negative value', () => {
    const allTables = [
      DEFAULT_LOOT_TABLE,
      ELITE_LOOT_TABLE,
      RARE_LOOT_TABLE,
      ROOM_CLEAR_LOOT_TABLE,
      ICE_CAVE_LOOT_TABLE,
      RUINS_LOOT_TABLE,
    ];
    for (const table of allTables) {
      for (const entry of table) {
        expect(entry.weight).toBeGreaterThan(0);
        expect(entry.value).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

// ── Balance ───────────────────────────────────────────────────────────────────

describe('balance data', () => {
  it('RARITY_BASE_WEIGHTS covers all rarity tiers', () => {
    const rarities = Object.keys(RARITY_BASE_WEIGHTS);
    expect(rarities).toContain(Rarity.Common);
    expect(rarities).toContain(Rarity.Uncommon);
    expect(rarities).toContain(Rarity.Rare);
    expect(rarities).toContain(Rarity.Epic);
    expect(rarities).toContain(Rarity.Legendary);
  });

  it('rarity weights descend from Common to Legendary', () => {
    expect(RARITY_BASE_WEIGHTS[Rarity.Common]).toBeGreaterThan(
      RARITY_BASE_WEIGHTS[Rarity.Uncommon],
    );
    expect(RARITY_BASE_WEIGHTS[Rarity.Uncommon]).toBeGreaterThan(RARITY_BASE_WEIGHTS[Rarity.Rare]);
    expect(RARITY_BASE_WEIGHTS[Rarity.Rare]).toBeGreaterThan(RARITY_BASE_WEIGHTS[Rarity.Epic]);
    expect(RARITY_BASE_WEIGHTS[Rarity.Epic]).toBeGreaterThan(RARITY_BASE_WEIGHTS[Rarity.Legendary]);
  });

  it('BIOME_RELIC_SOURCES covers all Biome enum values', () => {
    const biomeValues = Object.values(Biome);
    for (const biome of biomeValues) {
      expect(BIOME_RELIC_SOURCES[biome]).toBeDefined();
      expect(BIOME_RELIC_SOURCES[biome].length).toBeGreaterThan(0);
    }
  });

  it('RARITY_BIOME_FOCUS covers all Rarity enum values', () => {
    const rarityValues = Object.values(Rarity);
    for (const rarity of rarityValues) {
      expect(RARITY_BIOME_FOCUS[rarity]).toBeDefined();
    }
  });
});
