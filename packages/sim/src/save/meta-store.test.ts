import { describe, it, expect } from 'vitest';
import { defaultMetaProgression, type RunSummary } from '@echo-party/shared';
import { recordRun, MAX_RUN_HISTORY } from './meta-store';

function makeSummary(overrides: Partial<RunSummary> = {}): RunSummary {
  return {
    seed: 'test-seed',
    roomsCleared: 3,
    enemiesDefeated: 10,
    damageDealt: 200,
    damageTaken: 50,
    itemsCollected: 5,
    durationMs: 30000,
    victory: true,
    ...overrides,
  };
}

describe('meta-store', () => {
  describe('recordRun', () => {
    it('increments totalRuns and totalVictories on victory', () => {
      const meta = defaultMetaProgression();
      const result = recordRun(meta, makeSummary({ victory: true }));
      expect(result.totalRuns).toBe(1);
      expect(result.totalVictories).toBe(1);
    });

    it('increments totalRuns but NOT totalVictories on defeat', () => {
      const meta = defaultMetaProgression();
      const result = recordRun(meta, makeSummary({ victory: false }));
      expect(result.totalRuns).toBe(1);
      expect(result.totalVictories).toBe(0);
    });

    it('accumulates lifetime stats', () => {
      let meta = defaultMetaProgression();
      meta = recordRun(meta, makeSummary({ enemiesDefeated: 5, damageDealt: 100 }));
      meta = recordRun(meta, makeSummary({ enemiesDefeated: 3, damageDealt: 80 }));
      expect(meta.lifetimeEnemiesDefeated).toBe(8);
      expect(meta.lifetimeDamageDealt).toBe(180);
    });

    it('prepends run to history (most recent first)', () => {
      let meta = defaultMetaProgression();
      meta = recordRun(meta, makeSummary({ seed: 'run-1' }));
      meta = recordRun(meta, makeSummary({ seed: 'run-2' }));
      expect(meta.runHistory[0].seed).toBe('run-2');
      expect(meta.runHistory[1].seed).toBe('run-1');
    });

    it('caps run history at MAX_RUN_HISTORY', () => {
      let meta = defaultMetaProgression();
      for (let i = 0; i < MAX_RUN_HISTORY + 10; i++) {
        meta = recordRun(meta, makeSummary({ seed: `run-${i}` }));
      }
      expect(meta.runHistory.length).toBe(MAX_RUN_HISTORY);
      // Most recent should be the last one added
      expect(meta.runHistory[0].seed).toBe(`run-${MAX_RUN_HISTORY + 9}`);
    });

    it('does not mutate the input meta object', () => {
      const meta = defaultMetaProgression();
      const result = recordRun(meta, makeSummary());
      expect(meta.totalRuns).toBe(0);
      expect(result.totalRuns).toBe(1);
    });
  });
});
