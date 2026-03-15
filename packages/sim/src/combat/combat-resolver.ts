import type { StatBlock } from '@echo-party/shared';

/** Result of a single combat exchange */
export interface CombatResult {
  damage: number;
  targetDied: boolean;
}

/**
 * Calculate and apply damage: damage = max(1, attacker.attack - defender.defense).
 * Returns the damage dealt and whether the target died.
 */
export function resolveDamage(attacker: StatBlock, defender: StatBlock): CombatResult {
  const rawDamage = attacker.attack - defender.defense;
  const damage = Math.max(1, rawDamage);
  defender.currentHp = Math.max(0, defender.currentHp - damage);
  return {
    damage,
    targetDied: defender.currentHp <= 0,
  };
}
