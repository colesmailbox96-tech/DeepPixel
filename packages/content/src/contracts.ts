import { Difficulty, type ContractDef } from '@echo-party/shared';

/** Available contracts for Phase 2 */
export const CONTRACTS: readonly ContractDef[] = [
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
] as const;
