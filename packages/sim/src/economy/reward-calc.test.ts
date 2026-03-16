import { describe, it, expect } from 'vitest';
import { Difficulty } from '@echo-party/shared';
import type { ContractModifier } from '@echo-party/shared';
import { calculateRunReward } from './reward-calc';

describe('calculateRunReward', () => {
  it('calculates base reward for normal difficulty', () => {
    const reward = calculateRunReward(50, 3, Difficulty.Normal, true);
    // baseCoins=50, roomClearBonus=3*10=30, milestoneBonus=floor(3/3)*25=25,
    // progressionBonus=max(0,3-4)*5=0, victoryBonus=50
    // total = (50 + 30 + 25 + 0 + 50) * 1.0 = 155
    expect(reward.baseCoins).toBe(50);
    expect(reward.roomClearBonus).toBe(30);
    expect(reward.milestoneBonus).toBe(25);
    expect(reward.progressionBonus).toBe(0);
    expect(reward.victoryBonus).toBe(50);
    expect(reward.totalCoins).toBe(155);
  });

  it('applies difficulty multiplier for hard', () => {
    const reward = calculateRunReward(50, 3, Difficulty.Hard, true);
    // (50 + 30 + 25 + 0 + 50) * 1.5 = 232.5 → 233
    expect(reward.difficultyMultiplier).toBe(1.5);
    expect(reward.totalCoins).toBe(233);
  });

  it('applies difficulty multiplier for nightmare', () => {
    const reward = calculateRunReward(50, 3, Difficulty.Nightmare, true);
    // (50 + 30 + 25 + 0 + 50) * 2.0 = 310
    expect(reward.difficultyMultiplier).toBe(2.0);
    expect(reward.totalCoins).toBe(310);
  });

  it('gives no victory bonus on defeat', () => {
    const reward = calculateRunReward(50, 3, Difficulty.Normal, false);
    // (50 + 30 + 25 + 0 + 0) * 1.0 = 105
    expect(reward.victoryBonus).toBe(0);
    expect(reward.totalCoins).toBe(105);
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
    // (50 + 30 + 25 + 0 + 50) * 1.0 * 2.0 = 310
    expect(reward.totalCoins).toBe(310);
  });

  it('handles zero coins and zero rooms', () => {
    const reward = calculateRunReward(0, 0, Difficulty.Normal, false);
    expect(reward.totalCoins).toBe(0);
  });

  it('awards milestone bonus every 3 rooms', () => {
    const reward = calculateRunReward(0, 6, Difficulty.Normal, false);
    // milestoneBonus = floor(6/3) * 25 = 50
    expect(reward.milestoneBonus).toBe(50);
  });

  it('awards progression bonus for runs longer than 4 rooms', () => {
    const reward = calculateRunReward(0, 7, Difficulty.Normal, false);
    // progressionBonus = (7-4) * 5 = 15
    expect(reward.progressionBonus).toBe(15);
  });

  it('stacks milestone and progression bonuses correctly', () => {
    const reward = calculateRunReward(100, 8, Difficulty.Hard, true);
    // milestoneBonus = floor(8/3) * 25 = 50
    // progressionBonus = (8-4) * 5 = 20
    // roomClearBonus = 8 * 10 = 80
    // total = (100 + 80 + 50 + 20 + 50) * 1.5 = 450
    expect(reward.milestoneBonus).toBe(50);
    expect(reward.progressionBonus).toBe(20);
    expect(reward.totalCoins).toBe(450);
  });
});
