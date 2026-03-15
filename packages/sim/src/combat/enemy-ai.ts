import type { Position } from '@echo-party/shared';
import type { EnemyEntity } from '../procgen/enemy-spawn';

/** Compute tile distance between two positions */
function tileDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/** Action an enemy wants to take this tick */
export interface EnemyAction {
  enemyId: string;
  type: 'move' | 'attack';
  targetPosition: Position;
}

/**
 * Simple enemy AI: if within attack range, attack. Otherwise, move toward the player.
 * Returns one action per alive enemy.
 */
export function computeEnemyActions(
  enemies: EnemyEntity[],
  playerPos: Position,
): EnemyAction[] {
  const actions: EnemyAction[] = [];

  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    const dist = tileDistance(enemy.position, playerPos);

    if (dist <= enemy.attackRange) {
      actions.push({
        enemyId: enemy.id,
        type: 'attack',
        targetPosition: playerPos,
      });
    } else {
      // Move one tile toward the player (Manhattan movement)
      const dx = Math.sign(playerPos.x - enemy.position.x);
      const dy = Math.sign(playerPos.y - enemy.position.y);
      actions.push({
        enemyId: enemy.id,
        type: 'move',
        targetPosition: {
          x: enemy.position.x + dx,
          y: enemy.position.y + dy,
        },
      });
    }
  }

  return actions;
}
