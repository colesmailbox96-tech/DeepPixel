import type { EnemyArchetype, EnemyDef, Position, StatBlock, ContractModifier } from '@echo-party/shared';
import { SeededRng } from '../rng';
import { type RoomLayout, getFloorPositions } from './room-gen';

/** An enemy entity in the sim layer */
export interface EnemyEntity {
  id: string;
  archetype: EnemyArchetype;
  position: Position;
  stats: StatBlock;
  attackRange: number;
  alive: boolean;
  isElite: boolean;
}

/**
 * Apply contract-modifier stat scaling to a stat block (mutates).
 */
function applyModifierScaling(stats: StatBlock, modifiers: ContractModifier[]): void {
  for (const mod of modifiers) {
    if (mod.enemyHpScale) {
      stats.maxHp = Math.round(stats.maxHp * mod.enemyHpScale);
      stats.currentHp = stats.maxHp;
    }
    if (mod.enemyAtkScale) {
      stats.attack = Math.round(stats.attack * mod.enemyAtkScale);
    }
  }
}

/**
 * Spawn enemies in a room using RNG.
 * Avoids placing enemies on walls or on the player spawn position.
 *
 * `eliteDefs`, `modifiers`, and `preferredArchetypes` are optional Phase 5
 * parameters — omitting them preserves backward-compatible behaviour.
 */
export function spawnEnemies(
  rng: SeededRng,
  layout: RoomLayout,
  enemyDefs: EnemyDef[],
  count: number,
  playerPos: Position,
  eliteDefs?: EnemyDef[],
  modifiers?: ContractModifier[],
  preferredArchetypes?: EnemyArchetype[],
): EnemyEntity[] {
  const floors = getFloorPositions(layout).filter(
    (p) => Math.abs(p.x - playerPos.x) > 2 || Math.abs(p.y - playerPos.y) > 2,
  );

  if (floors.length === 0) return [];

  rng.shuffle(floors);

  // Build the pool: biome-preferred enemies are weighted 2× in the pool
  let pool: EnemyDef[] = [...enemyDefs];
  if (preferredArchetypes && preferredArchetypes.length > 0) {
    const preferred = enemyDefs.filter((d) => preferredArchetypes.includes(d.archetype));
    pool = [...pool, ...preferred]; // duplicates = higher weight
  }

  const spawnCount = Math.min(count, floors.length);
  const enemies: EnemyEntity[] = [];

  // Decide whether to include an elite (base 15%, boosted to 40% with modifier)
  const boostedElites = modifiers?.some((m) => m.boostedElites) ?? false;
  const eliteChance = boostedElites ? 0.4 : 0.15;
  const hasElitePool = eliteDefs && eliteDefs.length > 0;

  for (let i = 0; i < spawnCount; i++) {
    const tryElite = hasElitePool && rng.next() < eliteChance;
    const def = tryElite ? rng.pick(eliteDefs!) : rng.pick(pool);
    const pos = floors[i];
    const stats = { ...def.stats };

    if (modifiers && modifiers.length > 0) {
      applyModifierScaling(stats, modifiers);
    }

    enemies.push({
      id: `enemy-${i}`,
      archetype: def.archetype,
      position: { x: pos.x, y: pos.y },
      stats,
      attackRange: def.attackRange,
      alive: true,
      isElite: def.isElite ?? false,
    });
  }

  return enemies;
}
