import type { Position } from '@echo-party/shared';
import type { EnemyEntity } from '../procgen/enemy-spawn';

/** Compute Chebyshev distance between two positions (diagonal = 1) */
function tileDistance(a: Position, b: Position): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

/** Action an enemy wants to take this tick */
export interface EnemyAction {
  enemyId: string;
  type: 'move' | 'attack';
  targetPosition: Position;
}

/**
 * Simple enemy AI: if within attack range of the nearest target, attack.
 * Otherwise, move toward the nearest target.
 *
 * When an Echo companion position is provided, enemies consider both the
 * player and the Echo as valid targets, picking whichever is closer.
 *
 * Returns one action per alive enemy.
 */
export function computeEnemyActions(
  enemies: EnemyEntity[],
  playerPos: Position,
  echoPos?: Position | null,
): EnemyAction[] {
  const actions: EnemyAction[] = [];

  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    // Pick the nearest target between player and Echo
    const distToPlayer = tileDistance(enemy.position, playerPos);
    const distToEcho = echoPos ? tileDistance(enemy.position, echoPos) : Infinity;
    const targetPos = distToEcho < distToPlayer ? echoPos! : playerPos;
    const dist = Math.min(distToPlayer, distToEcho);

    if (dist <= enemy.attackRange) {
      actions.push({
        enemyId: enemy.id,
        type: 'attack',
        targetPosition: targetPos,
      });
    } else {
      // Move one tile toward the nearest target on a single axis per tick,
      // prioritizing the axis with greater distance to avoid diagonal wall clipping.
      const absDx = Math.abs(targetPos.x - enemy.position.x);
      const absDy = Math.abs(targetPos.y - enemy.position.y);
      let dx: number;
      let dy: number;
      if (absDx >= absDy) {
        dx = Math.sign(targetPos.x - enemy.position.x);
        dy = 0;
      } else {
        dx = 0;
        dy = Math.sign(targetPos.y - enemy.position.y);
      }
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
