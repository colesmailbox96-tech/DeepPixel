import type { Direction, EchoProfileV1, EnemyArchetype, Position } from '@echo-party/shared';
import type { ActionLog } from './action-log';
import { deltaToDirection } from './action-log';

/**
 * Distill an ActionLog into an EchoProfileV1.
 *
 * The algorithm scans every recorded tick and computes normalized
 * behavioral traits. All trait values are clamped to [0, 1].
 *
 * @param log       – full action log from the completed run
 * @param sourceSeed – seed of the originating run
 * @param id        – unique Echo ID (caller generates)
 * @param name      – human-readable label
 */
export function distillEcho(
  log: ActionLog,
  sourceSeed: string,
  id: string,
  name: string,
): EchoProfileV1 {
  const entries = log.entries;
  const total = entries.length;

  if (total === 0) {
    return emptyProfile(id, name, sourceSeed);
  }

  // ── Aggression & ability priority ────────────────────────────────────
  let attackCount = 0;
  let moveCount = 0;

  for (const e of entries) {
    if (e.action?.type === 'attack') attackCount++;
    if (e.action?.type === 'move') moveCount++;
  }

  const actionCount = attackCount + moveCount;
  const aggression = actionCount > 0 ? attackCount / actionCount : 0;
  const abilityPriority = aggression; // same metric for MVP

  // ── Movement bias ────────────────────────────────────────────────────
  const dirCounts: Partial<Record<Direction, number>> = {};
  for (const e of entries) {
    if (e.action?.type === 'move') {
      const dir = deltaToDirection(e.action.dx, e.action.dy);
      if (dir) {
        dirCounts[dir] = (dirCounts[dir] ?? 0) + 1;
      }
    }
  }
  const movementBias: Partial<Record<Direction, number>> = {};
  if (moveCount > 0) {
    for (const [dir, count] of Object.entries(dirCounts)) {
      movementBias[dir as Direction] = count / moveCount;
    }
  }

  // ── Keep-distance preference ─────────────────────────────────────────
  let totalMinDist = 0;
  let distSamples = 0;
  for (const e of entries) {
    if (e.enemyPositions.length === 0) continue;
    const minDist = Math.min(
      ...e.enemyPositions.map((ep) => chebyshevDist(e.playerPos, ep)),
    );
    totalMinDist += minDist;
    distSamples++;
  }
  // Normalise: 0 ≈ always adjacent, 1 ≈ kept ~10+ tiles away
  const avgMinDist = distSamples > 0 ? totalMinDist / distSamples : 0;
  const keepDistance = clamp01(avgMinDist / 10);

  // ── Target selection ─────────────────────────────────────────────────
  const killCounts: Partial<Record<EnemyArchetype, number>> = {};
  let totalKills = 0;
  for (const e of entries) {
    if (e.killedArchetype) {
      killCounts[e.killedArchetype] = (killCounts[e.killedArchetype] ?? 0) + 1;
      totalKills++;
    }
  }
  const targetSelection: Partial<Record<EnemyArchetype, number>> = {};
  if (totalKills > 0) {
    for (const [arch, count] of Object.entries(killCounts)) {
      targetSelection[arch as EnemyArchetype] = count / totalKills;
    }
  }

  // ── Survivability bias ───────────────────────────────────────────────
  // Measure how often the player was far from enemies vs. close.
  // More time far away → higher survivability bias (evasive).
  let farTicks = 0;
  for (const e of entries) {
    if (e.enemyPositions.length === 0) continue;
    const minDist = Math.min(
      ...e.enemyPositions.map((ep) => chebyshevDist(e.playerPos, ep)),
    );
    if (minDist > 2) farTicks++;
  }
  const survivabilityBias = distSamples > 0 ? clamp01(farTicks / distSamples) : 0.5;

  return {
    version: 1,
    id,
    name,
    createdAt: new Date().toISOString(),
    sourceSeed,
    aggression: round2(aggression),
    movementBias: roundRecord(movementBias),
    keepDistance: round2(keepDistance),
    targetSelection: roundRecord(targetSelection),
    abilityPriority: round2(abilityPriority),
    survivabilityBias: round2(survivabilityBias),
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function chebyshevDist(a: Position, b: Position): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function roundRecord<K extends string>(rec: Partial<Record<K, number>>): Partial<Record<K, number>> {
  const out: Partial<Record<K, number>> = {};
  for (const [k, v] of Object.entries(rec) as [K, number][]) {
    out[k] = round2(v);
  }
  return out;
}

function emptyProfile(id: string, name: string, sourceSeed: string): EchoProfileV1 {
  return {
    version: 1,
    id,
    name,
    createdAt: new Date().toISOString(),
    sourceSeed,
    aggression: 0,
    movementBias: {},
    keepDistance: 0.5,
    targetSelection: {},
    abilityPriority: 0,
    survivabilityBias: 0.5,
  };
}
