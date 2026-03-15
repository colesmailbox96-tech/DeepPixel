import type { EnemyArchetype, EnemyDef, Position, StatBlock } from '@echo-party/shared';
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
}

/**
 * Spawn enemies in a room using RNG.
 * Avoids placing enemies on walls or on the player spawn position.
 */
export function spawnEnemies(
  rng: SeededRng,
  layout: RoomLayout,
  enemyDefs: EnemyDef[],
  count: number,
  playerPos: Position,
): EnemyEntity[] {
  const floors = getFloorPositions(layout).filter(
    (p) => Math.abs(p.x - playerPos.x) > 2 || Math.abs(p.y - playerPos.y) > 2,
  );

  if (floors.length === 0) return [];

  rng.shuffle(floors);

  const spawnCount = Math.min(count, floors.length);
  const enemies: EnemyEntity[] = [];

  for (let i = 0; i < spawnCount; i++) {
    const def = rng.pick(enemyDefs);
    const pos = floors[i];
    enemies.push({
      id: `enemy-${i}`,
      archetype: def.archetype,
      position: { x: pos.x, y: pos.y },
      stats: { ...def.stats },
      attackRange: def.attackRange,
      alive: true,
    });
  }

  return enemies;
}
