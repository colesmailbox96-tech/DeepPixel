import { describe, it, expect } from 'vitest';
import { resolveDamage } from './combat-resolver';
import type { StatBlock } from '@echo-party/shared';

function makeStats(overrides: Partial<StatBlock> = {}): StatBlock {
  return { maxHp: 100, currentHp: 100, attack: 10, defense: 5, speed: 3, ...overrides };
}

describe('resolveDamage', () => {
  it('calculates damage as attack - defense', () => {
    const attacker = makeStats({ attack: 10 });
    const defender = makeStats({ defense: 3, currentHp: 50 });

    const result = resolveDamage(attacker, defender);
    expect(result.damage).toBe(7);
    expect(defender.currentHp).toBe(43);
    expect(result.targetDied).toBe(false);
  });

  it('deals minimum 1 damage even if defense >= attack', () => {
    const attacker = makeStats({ attack: 3 });
    const defender = makeStats({ defense: 10, currentHp: 50 });

    const result = resolveDamage(attacker, defender);
    expect(result.damage).toBe(1);
    expect(defender.currentHp).toBe(49);
  });

  it('kills the defender when HP reaches 0', () => {
    const attacker = makeStats({ attack: 20 });
    const defender = makeStats({ defense: 5, currentHp: 10 });

    const result = resolveDamage(attacker, defender);
    expect(result.damage).toBe(15);
    expect(defender.currentHp).toBe(0);
    expect(result.targetDied).toBe(true);
  });

  it('does not reduce HP below 0', () => {
    const attacker = makeStats({ attack: 100 });
    const defender = makeStats({ defense: 0, currentHp: 5 });

    const result = resolveDamage(attacker, defender);
    expect(defender.currentHp).toBe(0);
    expect(result.targetDied).toBe(true);
  });

  it('mutates the defender stats in place', () => {
    const attacker = makeStats({ attack: 10 });
    const defender = makeStats({ defense: 5, currentHp: 50 });

    resolveDamage(attacker, defender);
    expect(defender.currentHp).toBe(45);
  });
});
