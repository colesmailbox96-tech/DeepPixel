import { StatBlock } from './types';

/** Enemy archetype identifiers */
export type EnemyArchetype =
  | 'slime'
  | 'goblin'
  | 'archer'
  | 'skeleton'
  | 'wraith'
  | 'brute'
  | 'bomber'
  | 'spider'
  | 'drake'
  | 'lich';

/** Definition for an enemy type */
export interface EnemyDef {
  archetype: EnemyArchetype;
  name: string;
  stats: StatBlock;
  /** Tile-based attack range: 1 = melee, >1 = ranged */
  attackRange: number;
  /** Colour used for placeholder sprite (0xRRGGBB number) */
  placeholderColor: number;
  /** If true, this definition describes an elite variant */
  isElite?: boolean;
}
