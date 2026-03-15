import { describe, it, expect } from 'vitest';
import { createRunState } from './run-state';
import { Difficulty } from '@echo-party/shared';

describe('createRunState', () => {
  it('creates a run state with Normal difficulty', () => {
    const state = createRunState({
      seed: 'test-seed',
      difficulty: Difficulty.Normal,
      contractId: 'contract-001',
    });

    expect(state.player.maxHp).toBe(100);
    expect(state.player.currentHp).toBe(100);
    expect(state.currentRoom).toBe(0);
    expect(state.completed).toBe(false);
    expect(state.victory).toBe(false);
    expect(state.config.seed).toBe('test-seed');
  });

  it('creates a run state with Hard difficulty', () => {
    const state = createRunState({
      seed: 'hard-seed',
      difficulty: Difficulty.Hard,
      contractId: 'contract-002',
    });

    expect(state.player.maxHp).toBe(80);
    expect(state.player.currentHp).toBe(80);
  });

  it('creates a run state with Nightmare difficulty', () => {
    const state = createRunState({
      seed: 'nightmare-seed',
      difficulty: Difficulty.Nightmare,
      contractId: 'contract-003',
    });

    expect(state.player.maxHp).toBe(60);
    expect(state.player.currentHp).toBe(60);
  });

  it('initializes counters at zero', () => {
    const state = createRunState({
      seed: 'counter-seed',
      difficulty: Difficulty.Normal,
      contractId: 'contract-001',
    });

    expect(state.enemiesDefeated).toBe(0);
    expect(state.damageDealt).toBe(0);
    expect(state.damageTaken).toBe(0);
    expect(state.itemsCollected).toBe(0);
  });
});
