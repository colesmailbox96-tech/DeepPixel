import type { EnemyArchetype, Direction } from './types';

/**
 * EchoProfileV1 — a distilled tactical profile of a player's run.
 *
 * This is NOT a replay ghost. It captures behavioral traits that
 * drive companion AI when the Echo joins a future run.
 */
export interface EchoProfileV1 {
  /** Schema version for forward-compatible storage */
  readonly version: 1;
  /** Unique identifier for this Echo */
  id: string;
  /** Human-readable label (e.g., "Run #3 Echo") */
  name: string;
  /** ISO-8601 timestamp when the Echo was created */
  createdAt: string;
  /** Seed of the originating run (for traceability) */
  sourceSeed: string;

  // ── Behavioral traits (all 0–1 unless noted) ──────────────────────────

  /**
   * How aggressively the player attacked.
   * 0 = almost never attacked, 1 = attacked every opportunity.
   */
  aggression: number;

  /**
   * Directional movement frequency map.
   * Values are proportions that sum to ≤ 1 (remaining fraction is "no move").
   */
  movementBias: Partial<Record<Direction, number>>;

  /**
   * Preferred engagement distance.
   * 0 = always adjacent (melee), 1 = stayed far away (ranged).
   */
  keepDistance: number;

  /**
   * Which enemy archetypes the player prioritised.
   * Mapped to proportion of total kills.
   */
  targetSelection: Partial<Record<EnemyArchetype, number>>;

  /**
   * Attack-vs-move preference.
   * 0 = almost always moved, 1 = almost always attacked.
   */
  abilityPriority: number;

  /**
   * Survivability strategy.
   * 0 = tanked damage (high damage taken ratio), 1 = evasive (low damage taken ratio).
   */
  survivabilityBias: number;
}

/** Maximum number of Echoes stored in the local library */
export const MAX_ECHO_LIBRARY_SIZE = 10;

/** Compact serialized form for IndexedDB / JSON storage */
export type SerializedEchoProfile = EchoProfileV1;
