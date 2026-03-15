import type { RunSummary, MetaProgression } from '@echo-party/shared';

/** Maximum number of run summaries kept in history */
const MAX_RUN_HISTORY = 50;

/**
 * Record a completed run in the meta-progression.
 * Returns a new MetaProgression (pure function — no mutation).
 */
export function recordRun(meta: MetaProgression, summary: RunSummary): MetaProgression {
  const history = [summary, ...meta.runHistory].slice(0, MAX_RUN_HISTORY);

  return {
    totalRuns: meta.totalRuns + 1,
    totalVictories: meta.totalVictories + (summary.victory ? 1 : 0),
    lifetimeEnemiesDefeated: meta.lifetimeEnemiesDefeated + summary.enemiesDefeated,
    lifetimeDamageDealt: meta.lifetimeDamageDealt + summary.damageDealt,
    runHistory: history,
  };
}

export { MAX_RUN_HISTORY };
