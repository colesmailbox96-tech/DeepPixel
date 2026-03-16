import type { Difficulty, ContractModifier } from '@echo-party/shared';

/** Reward summary after a run completes */
export interface RunReward {
  /** Base coins earned from enemy kills + pickups */
  baseCoins: number;
  /** Difficulty bonus multiplier applied */
  difficultyMultiplier: number;
  /** Room-clear bonus coins */
  roomClearBonus: number;
  /** Victory bonus (0 if player died) */
  victoryBonus: number;
  /** Total coins after all multipliers */
  totalCoins: number;
}

/** Difficulty → base coin multiplier */
const DIFFICULTY_COIN_MULTIPLIER: Record<string, number> = {
  normal: 1.0,
  hard: 1.5,
  nightmare: 2.0,
};

/** Coins awarded per cleared room */
const COINS_PER_ROOM = 10;

/** Flat bonus for completing a run */
const VICTORY_BONUS = 50;

/**
 * Calculate end-of-run rewards.
 *
 * @param coinsCollected — raw coins picked up during the run
 * @param roomsCleared — number of rooms cleared
 * @param difficulty — contract difficulty
 * @param victory — whether the player won
 * @param modifiers — optional contract modifiers
 */
export function calculateRunReward(
  coinsCollected: number,
  roomsCleared: number,
  difficulty: Difficulty,
  victory: boolean,
  modifiers?: ContractModifier[],
): RunReward {
  const difficultyMultiplier = DIFFICULTY_COIN_MULTIPLIER[difficulty] ?? 1.0;
  const coinModScale = modifiers?.reduce((s, m) => s * (m.coinScale ?? 1.0), 1.0) ?? 1.0;

  const baseCoins = coinsCollected;
  const roomClearBonus = roomsCleared * COINS_PER_ROOM;
  const victoryBonus = victory ? VICTORY_BONUS : 0;

  const totalCoins = Math.round(
    (baseCoins + roomClearBonus + victoryBonus) * difficultyMultiplier * coinModScale,
  );

  return {
    baseCoins,
    difficultyMultiplier,
    roomClearBonus,
    victoryBonus,
    totalCoins,
  };
}
