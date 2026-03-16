import { describe, it, expect } from 'vitest';
import { Difficulty } from '@echo-party/shared';
import type { ContractModifier } from '@echo-party/shared';
import {
  MILESTONE_INTERVAL,
  MILESTONE_COINS,
  PROGRESSION_THRESHOLD,
  PROGRESSION_EXTRA_COINS_PER_ROOM,
} from '@echo-party/content';
import { calculateRunReward } from './reward-calc';

/** Coins per room cleared — matches the constant in reward-calc.ts */
const COINS_PER_ROOM = 10;
/** Flat bonus for completing a run — matches the constant in reward-calc.ts */
const VICTORY_BONUS = 50;

describe('calculateRunReward', () => {
  it('calculates base reward for normal difficulty', () => {
    const rooms = 3;
    const coins = 50;
    const milestoneBonus = Math.floor(rooms / MILESTONE_INTERVAL) * MILESTONE_COINS;
    const progressionBonus =
      Math.max(0, rooms - PROGRESSION_THRESHOLD) * PROGRESSION_EXTRA_COINS_PER_ROOM;
    const expected =
      (coins + rooms * COINS_PER_ROOM + milestoneBonus + progressionBonus + VICTORY_BONUS) * 1.0;

    const reward = calculateRunReward(coins, rooms, Difficulty.Normal, true);
    expect(reward.baseCoins).toBe(coins);
    expect(reward.roomClearBonus).toBe(rooms * COINS_PER_ROOM);
    expect(reward.milestoneBonus).toBe(milestoneBonus);
    expect(reward.progressionBonus).toBe(progressionBonus);
    expect(reward.victoryBonus).toBe(VICTORY_BONUS);
    expect(reward.totalCoins).toBe(Math.round(expected));
  });

  it('applies difficulty multiplier for hard', () => {
    const reward = calculateRunReward(50, 3, Difficulty.Hard, true);
    expect(reward.difficultyMultiplier).toBe(1.5);
    const expectedBase =
      50 +
      3 * COINS_PER_ROOM +
      Math.floor(3 / MILESTONE_INTERVAL) * MILESTONE_COINS +
      VICTORY_BONUS;
    expect(reward.totalCoins).toBe(Math.round(expectedBase * 1.5));
  });

  it('applies difficulty multiplier for nightmare', () => {
    const reward = calculateRunReward(50, 3, Difficulty.Nightmare, true);
    expect(reward.difficultyMultiplier).toBe(2.0);
    const expectedBase =
      50 +
      3 * COINS_PER_ROOM +
      Math.floor(3 / MILESTONE_INTERVAL) * MILESTONE_COINS +
      VICTORY_BONUS;
    expect(reward.totalCoins).toBe(Math.round(expectedBase * 2.0));
  });

  it('gives no victory bonus on defeat', () => {
    const reward = calculateRunReward(50, 3, Difficulty.Normal, false);
    expect(reward.victoryBonus).toBe(0);
    const expectedBase =
      50 + 3 * COINS_PER_ROOM + Math.floor(3 / MILESTONE_INTERVAL) * MILESTONE_COINS;
    expect(reward.totalCoins).toBe(Math.round(expectedBase));
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
    const expectedBase =
      50 +
      3 * COINS_PER_ROOM +
      Math.floor(3 / MILESTONE_INTERVAL) * MILESTONE_COINS +
      VICTORY_BONUS;
    expect(reward.totalCoins).toBe(Math.round(expectedBase * 2.0));
  });

  it('handles zero coins and zero rooms', () => {
    const reward = calculateRunReward(0, 0, Difficulty.Normal, false);
    expect(reward.totalCoins).toBe(0);
  });

  it('awards milestone bonus every MILESTONE_INTERVAL rooms', () => {
    const rooms = MILESTONE_INTERVAL * 2;
    const reward = calculateRunReward(0, rooms, Difficulty.Normal, false);
    expect(reward.milestoneBonus).toBe(2 * MILESTONE_COINS);
  });

  it('awards progression bonus for runs longer than PROGRESSION_THRESHOLD', () => {
    const rooms = PROGRESSION_THRESHOLD + 3;
    const reward = calculateRunReward(0, rooms, Difficulty.Normal, false);
    expect(reward.progressionBonus).toBe(3 * PROGRESSION_EXTRA_COINS_PER_ROOM);
  });

  it('stacks milestone and progression bonuses correctly', () => {
    const rooms = 8;
    const coins = 100;
    const milestoneBonus = Math.floor(rooms / MILESTONE_INTERVAL) * MILESTONE_COINS;
    const progressionBonus =
      Math.max(0, rooms - PROGRESSION_THRESHOLD) * PROGRESSION_EXTRA_COINS_PER_ROOM;
    const expectedTotal = Math.round(
      (coins + rooms * COINS_PER_ROOM + milestoneBonus + progressionBonus + VICTORY_BONUS) * 1.5,
    );
    const reward = calculateRunReward(coins, rooms, Difficulty.Hard, true);
    expect(reward.milestoneBonus).toBe(milestoneBonus);
    expect(reward.progressionBonus).toBe(progressionBonus);
    expect(reward.totalCoins).toBe(expectedTotal);
  });
});
