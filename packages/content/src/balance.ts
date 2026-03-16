import { Biome, Rarity, type RelicId } from '@echo-party/shared';

/**
 * Phase 8 — Production-ready balancing data
 *
 * Central source of truth for rarity weights, reward scaling, and drop
 * source mappings. Tuning numbers here will affect the whole game without
 * touching individual content files.
 */

// ── Rarity drop weights ───────────────────────────────────────────────────────

/**
 * Base weight for each rarity tier when rolling loot.
 * Higher = more likely. Used by the loot resolver when no override is provided.
 */
export const RARITY_BASE_WEIGHTS: Record<Rarity, number> = {
  [Rarity.Common]: 60,
  [Rarity.Uncommon]: 25,
  [Rarity.Rare]: 10,
  [Rarity.Epic]: 4,
  [Rarity.Legendary]: 1,
};

// ── Reward scaling ────────────────────────────────────────────────────────────

/**
 * Milestone bonus awarded every N rooms cleared.
 * Stacks: clearing 6 rooms with MILESTONE_INTERVAL=3 grants 2 × MILESTONE_COINS.
 */
export const MILESTONE_INTERVAL = 3;
export const MILESTONE_COINS = 25;

/**
 * Progressive room bonus — extra coins awarded per room on top of the flat
 * COINS_PER_ROOM constant for long runs (rooms beyond PROGRESSION_THRESHOLD).
 */
export const PROGRESSION_THRESHOLD = 4;
export const PROGRESSION_EXTRA_COINS_PER_ROOM = 5;

// ── Drop source mapping ───────────────────────────────────────────────────────

/**
 * Maps each biome to the relic IDs that can drop there.
 * Useful for UI hinting (e.g. "Found in Ice Cave") and for targeted loot rolls.
 */
export const BIOME_RELIC_SOURCES: Record<Biome, RelicId[]> = {
  [Biome.Sewer]: [
    'relic-thorn-ring',
    'relic-lucky-coin',
    'relic-vampiric-fang',
    'relic-power-gauntlet',
  ],
  [Biome.Crypt]: [
    'relic-iron-skin',
    'relic-swift-boots',
    'relic-treasure-map',
    'relic-siphon-amulet',
    'relic-guardian-shield',
    'relic-room-heal',
  ],
  [Biome.Forest]: [
    'relic-lucky-coin',
    'relic-swift-boots',
    'relic-crit-lens',
    'relic-gold-magnet',
    'relic-berserker-helm',
    'relic-phoenix-feather',
  ],
  [Biome.Volcano]: [
    'relic-thorn-ring',
    'relic-power-gauntlet',
    'relic-berserker-helm',
    'relic-lifesteal-blade',
    'relic-executioner',
    'relic-void-heart',
  ],
  [Biome.IceCave]: [
    'relic-stone-amulet',
    'relic-battle-drum',
    'relic-mana-shard',
    'relic-guardian-shield',
    'relic-thorned-armor',
  ],
  [Biome.Ruins]: [
    'relic-bounty-coin',
    'relic-mana-shard',
    'relic-serpent-fang',
    'relic-thorned-armor',
    'relic-doom-sigil',
    'relic-void-heart',
  ],
};

/**
 * Maps each rarity tier to the biomes where it most commonly drops.
 * Common items drop in all biomes (baseline availability); higher tiers are
 * more focused on specific environments where the challenge justifies the reward.
 */
export const RARITY_BIOME_FOCUS: Record<Rarity, Biome[]> = {
  // Common drops are baseline — available everywhere so players are never starved.
  [Rarity.Common]: [Biome.Sewer, Biome.Crypt, Biome.Forest, Biome.Volcano, Biome.IceCave, Biome.Ruins],
  [Rarity.Uncommon]: [Biome.Crypt, Biome.Forest, Biome.IceCave, Biome.Ruins],
  [Rarity.Rare]: [Biome.Volcano, Biome.Ruins, Biome.IceCave],
  [Rarity.Epic]: [Biome.Volcano, Biome.Ruins],
  [Rarity.Legendary]: [Biome.Forest, Biome.Ruins],
};
