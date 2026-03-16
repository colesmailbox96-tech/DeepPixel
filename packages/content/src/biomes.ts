import { Biome, type EnemyArchetype } from '@echo-party/shared';

/** Rule variant for a biome — drives room generation and enemy selection */
export interface BiomeRules {
  biome: Biome;
  name: string;
  /** Minimum interior obstacle count */
  minObstacles: number;
  /** Maximum interior obstacle count */
  maxObstacles: number;
  /** Room width override (undefined = default) */
  roomWidth?: number;
  /** Room height override (undefined = default) */
  roomHeight?: number;
  /** Archetypes that appear more frequently in this biome */
  preferredEnemies: EnemyArchetype[];
}

/** 6 biome rule variants */
export const BIOME_RULES: Record<Biome, BiomeRules> = {
  [Biome.Sewer]: {
    biome: Biome.Sewer,
    name: 'Sewer',
    minObstacles: 1,
    maxObstacles: 3,
    preferredEnemies: ['slime', 'goblin', 'spider'],
  },
  [Biome.Crypt]: {
    biome: Biome.Crypt,
    name: 'Crypt',
    minObstacles: 2,
    maxObstacles: 5,
    preferredEnemies: ['skeleton', 'wraith', 'lich'],
  },
  [Biome.Forest]: {
    biome: Biome.Forest,
    name: 'Forest',
    minObstacles: 3,
    maxObstacles: 6,
    roomWidth: 17,
    roomHeight: 13,
    preferredEnemies: ['archer', 'spider', 'goblin'],
  },
  [Biome.Volcano]: {
    biome: Biome.Volcano,
    name: 'Volcano',
    minObstacles: 2,
    maxObstacles: 4,
    roomWidth: 13,
    roomHeight: 11,
    preferredEnemies: ['drake', 'brute', 'bomber'],
  },

  // ── Phase 8 additions ─────────────────────────────────────────────────────
  [Biome.IceCave]: {
    biome: Biome.IceCave,
    name: 'Ice Cave',
    minObstacles: 3,
    maxObstacles: 7,
    roomWidth: 13,
    roomHeight: 11,
    preferredEnemies: ['troll', 'bat', 'serpent'],
  },
  [Biome.Ruins]: {
    biome: Biome.Ruins,
    name: 'Ruins',
    minObstacles: 2,
    maxObstacles: 5,
    roomWidth: 17,
    roomHeight: 13,
    preferredEnemies: ['golem', 'witch', 'skeleton'],
  },
};
