import { describe, it, expect } from 'vitest';
import { Difficulty } from '@echo-party/shared';
import type { ContractModifier } from '@echo-party/shared';
import { calculateRunReward } from './reward-calc';

describe('calculateRunReward', () => {
  it('calculates base reward for normal difficulty', () => {
    const reward = calculateRunReward(50, 3, Difficulty.Normal, true);
    // (50 coins + 3*10 room bonus + 50 victory) * 1.0 = 130
    expect(reward.baseCoins).toBe(50);
    expect(reward.roomClearBonus).toBe(30);
    expect(reward.victoryBonus).toBe(50);
    expect(reward.totalCoins).toBe(130);
  });

  it('applies difficulty multiplier for hard', () => {
    const reward = calculateRunReward(50, 3, Difficulty.Hard, true);
    // (50 + 30 + 50) * 1.5 = 195
    expect(reward.difficultyMultiplier).toBe(1.5);
    expect(reward.totalCoins).toBe(195);
  });

  it('applies difficulty multiplier for nightmare', () => {
    const reward = calculateRunReward(50, 3, Difficulty.Nightmare, true);
    // (50 + 30 + 50) * 2.0 = 260
    expect(reward.difficultyMultiplier).toBe(2.0);
    expect(reward.totalCoins).toBe(260);
  });

  it('gives no victory bonus on defeat', () => {
    const reward = calculateRunReward(50, 3, Difficulty.Normal, false);
    // (50 + 30 + 0) * 1.0 = 80
    expect(reward.victoryBonus).toBe(0);
    expect(reward.totalCoins).toBe(80);
  });

  it('applies contract modifier coin scaling', () => {
    const mods: ContractModifier[] = [
      {
        id: 'mod-treasure',
        family: 'reward',
        name: 'Treasure',
        description: 'Double coins.',
        coinScale: 2.0,
      },
    ];
    const reward = calculateRunReward(50, 3, Difficulty.Normal, true, mods);
    // (50 + 30 + 50) * 1.0 * 2.0 = 260
    expect(reward.totalCoins).toBe(260);
  });

  it('handles zero coins and zero rooms', () => {
    const reward = calculateRunReward(0, 0, Difficulty.Normal, false);
    expect(reward.totalCoins).toBe(0);
  });
});
