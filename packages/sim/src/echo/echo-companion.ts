import type { EchoProfileV1, EnemyArchetype, Position, StatBlock } from '@echo-party/shared';
import { SeededRng } from '../rng';
import type { EnemyEntity } from '../procgen/enemy-spawn';

/**
 * Live state for an Echo companion during a run.
 */
export interface EchoCompanion {
  profile: EchoProfileV1;
  position: Position;
  stats: StatBlock;
  alive: boolean;
}

/** Action the Echo companion wants to take this tick */
export type EchoAction =
  | { type: 'move'; dx: number; dy: number }
  | { type: 'attack'; targetId: string };

/** Base stats for an Echo companion (intentionally weaker than the player) */
const ECHO_BASE_STATS: StatBlock = {
  maxHp: 50,
  currentHp: 50,
  attack: 6,
  defense: 3,
  speed: 2,
};

/** Create a fresh Echo companion for a run */
export function createEchoCompanion(profile: EchoProfileV1, spawnPos: Position): EchoCompanion {
  return {
    profile,
    position: { ...spawnPos },
    stats: { ...ECHO_BASE_STATS },
    alive: true,
  };
}

/**
 * Compute the Echo companion's action for this tick.
 *
 * The Echo's behaviour is driven by its distilled profile:
 *  - **aggression** → probability of attacking vs. moving
 *  - **keepDistance** → preferred engagement range
 *  - **targetSelection** → enemy archetype preference
 *  - **movementBias** → directional preference when moving
 *  - **survivabilityBias** → retreat when HP is low
 *
 * Returns null if the Echo has no valid action (e.g., no enemies, dead).
 */
export function computeEchoAction(
  echo: EchoCompanion,
  enemies: readonly EnemyEntity[],
  playerPos: Position,
  rng: SeededRng,
): EchoAction | null {
  if (!echo.alive) return null;

  const aliveEnemies = enemies.filter((e) => e.alive);
  if (aliveEnemies.length === 0) {
    // No enemies — move toward the player if far away
    const distToPlayer = chebyshevDist(echo.position, playerPos);
    if (distToPlayer > 3) {
      return moveToward(echo.position, playerPos);
    }
    return null;
  }

  // ── Low HP retreat ──────────────────────────────────────────────────
  const hpRatio = echo.stats.currentHp / echo.stats.maxHp;
  if (hpRatio < 0.25 && echo.profile.survivabilityBias > 0.5) {
    const nearest = findNearestEnemy(echo.position, aliveEnemies);
    if (nearest && chebyshevDist(echo.position, nearest.position) <= 2) {
      return moveAway(echo.position, nearest.position);
    }
  }

  // ── Pick target based on targetSelection profile ────────────────────
  const target = pickTarget(echo, aliveEnemies, rng);
  if (!target) return null;

  const distToTarget = chebyshevDist(echo.position, target.position);

  // ── Decide attack vs move based on aggression ───────────────────────
  const preferredRange = Math.max(1, Math.round(echo.profile.keepDistance * 5));

  if (distToTarget <= 1) {
    // Adjacent — high aggression Echoes attack, low aggression may reposition
    if (rng.next() < echo.profile.aggression) {
      return { type: 'attack', targetId: target.id };
    }
    // Low-aggression Echoes sometimes back away
    if (echo.profile.keepDistance > 0.5) {
      return moveAway(echo.position, target.position);
    }
    return { type: 'attack', targetId: target.id };
  }

  if (distToTarget <= preferredRange) {
    // Within preferred range — approach to attack range
    return moveToward(echo.position, target.position);
  }

  // Far from preferred range — move toward target
  return moveToward(echo.position, target.position);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function chebyshevDist(a: Position, b: Position): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

function findNearestEnemy(
  pos: Position,
  enemies: readonly EnemyEntity[],
): EnemyEntity | null {
  let best: EnemyEntity | null = null;
  let bestDist = Infinity;
  for (const e of enemies) {
    const d = chebyshevDist(pos, e.position);
    if (d < bestDist) {
      bestDist = d;
      best = e;
    }
  }
  return best;
}

/**
 * Pick an enemy to target, weighted by the Echo's targetSelection profile.
 * Enemies whose archetype is preferred are more likely to be chosen.
 */
function pickTarget(
  echo: EchoCompanion,
  enemies: readonly EnemyEntity[],
  rng: SeededRng,
): EnemyEntity | null {
  if (enemies.length === 0) return null;

  // Build weighted scores: base weight 1.0, +2.0 for preferred archetypes
  const weights: number[] = enemies.map((e) => {
    const pref = echo.profile.targetSelection[e.archetype] ?? 0;
    return 1.0 + pref * 2.0;
  });

  // Also bias toward closer targets
  const pos = echo.position;
  for (let i = 0; i < enemies.length; i++) {
    const dist = chebyshevDist(pos, enemies[i].position);
    weights[i] *= 1.0 / (1.0 + dist * 0.3);
  }

  const totalWeight = weights.reduce((s, w) => s + w, 0);
  if (totalWeight <= 0) return enemies[0];

  let roll = rng.next() * totalWeight;
  for (let i = 0; i < enemies.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return enemies[i];
  }
  return enemies[enemies.length - 1];
}

function moveToward(from: Position, to: Position): EchoAction {
  const absDx = Math.abs(to.x - from.x);
  const absDy = Math.abs(to.y - from.y);
  let dx: number;
  let dy: number;
  if (absDx >= absDy) {
    dx = Math.sign(to.x - from.x);
    dy = 0;
  } else {
    dx = 0;
    dy = Math.sign(to.y - from.y);
  }
  return { type: 'move', dx, dy };
}

function moveAway(from: Position, threat: Position): EchoAction {
  const absDx = Math.abs(threat.x - from.x);
  const absDy = Math.abs(threat.y - from.y);
  let dx: number;
  let dy: number;
  if (absDx >= absDy) {
    dx = -Math.sign(threat.x - from.x);
    dy = 0;
  } else {
    dx = 0;
    dy = -Math.sign(threat.y - from.y);
  }
  // Fall back to any direction if already on same axis
  if (dx === 0 && dy === 0) dx = 1;
  return { type: 'move', dx, dy };
}
