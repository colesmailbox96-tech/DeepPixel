import { Difficulty, type ContractDef } from '@echo-party/shared';
import { MOD_FORTIFIED, MOD_ELITE_SURGE, MOD_TREASURE_HUNT, MOD_ENRAGED, MOD_DEEP_DELVE, MOD_ARMORED_HORDE, MOD_SCAVENGER } from './contract-modifiers';

/** Available contracts */
export const CONTRACTS: readonly ContractDef[] = [
  // ── Phase 2 originals (unmodified for backward compatibility) ──────────
  {
    id: 'contract-sewer-sweep',
    name: 'Sewer Sweep',
    description: 'Clear the sewers of slimes and goblins.',
    difficulty: Difficulty.Normal,
    roomCount: 3,
  },
  {
    id: 'contract-goblin-raid',
    name: 'Goblin Raid',
    description: 'A goblin warband has taken the old fort. Deal with them.',
    difficulty: Difficulty.Hard,
    roomCount: 4,
  },
  {
    id: 'contract-dark-depths',
    name: 'Dark Depths',
    description: 'Descend into the nightmare depths. No one has returned.',
    difficulty: Difficulty.Nightmare,
    roomCount: 5,
  },

  // ── Phase 5 contracts with modifiers and biome hints ───────────────────
  {
    id: 'contract-crypt-crawl',
    name: 'Crypt Crawl',
    description: 'Undead stir beneath the cathedral. Bring a torch.',
    difficulty: Difficulty.Hard,
    roomCount: 5,
    modifiers: [MOD_FORTIFIED],
  },
  {
    id: 'contract-forest-ambush',
    name: 'Forest Ambush',
    description: 'Bandits and beasts lurk in the overgrown trail.',
    difficulty: Difficulty.Normal,
    roomCount: 4,
    modifiers: [MOD_TREASURE_HUNT],
  },
  {
    id: 'contract-volcano-descent',
    name: 'Volcano Descent',
    description: 'Drakes and brutes guard the molten core.',
    difficulty: Difficulty.Nightmare,
    roomCount: 6,
    modifiers: [MOD_ENRAGED, MOD_ELITE_SURGE],
  },
  {
    id: 'contract-deep-sewer',
    name: 'Deep Sewer Expedition',
    description: 'An extended delve into the depths below the city.',
    difficulty: Difficulty.Hard,
    roomCount: 4,
    modifiers: [MOD_DEEP_DELVE, MOD_SCAVENGER],
  },
  {
    id: 'contract-horde-assault',
    name: 'Horde Assault',
    description: 'Wave after wave — survive or be overwhelmed.',
    difficulty: Difficulty.Nightmare,
    roomCount: 7,
    modifiers: [MOD_ARMORED_HORDE],
  },
] as const;
