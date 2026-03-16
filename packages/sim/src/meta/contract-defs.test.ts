import { describe, it, expect } from 'vitest';
import { Difficulty } from '@echo-party/shared';
import { buildRunConfig, buildResolvedRunConfig } from './contract-defs';

describe('buildRunConfig', () => {
  it('builds a config for an existing contract', () => {
    const config = buildRunConfig('contract-sewer-sweep', 'test-seed');
    expect(config.seed).toBe('test-seed');
    expect(config.difficulty).toBe(Difficulty.Normal);
    expect(config.contractId).toBe('contract-sewer-sweep');
  });

  it('throws for unknown contract', () => {
    expect(() => buildRunConfig('no-such-contract', 'test-seed')).toThrow('Unknown contract');
  });
});

describe('buildResolvedRunConfig', () => {
  it('resolves a contract without modifiers', () => {
    const config = buildResolvedRunConfig('contract-sewer-sweep', 'test-seed');
    expect(config.modifiers).toHaveLength(0);
    expect(config.effectiveRoomCount).toBe(3);
  });

  it('resolves a contract with modifiers and extra rooms', () => {
    const config = buildResolvedRunConfig('contract-deep-sewer', 'test-seed');
    expect(config.modifiers.length).toBeGreaterThan(0);
    // contract-deep-sewer has roomCount 4 + MOD_DEEP_DELVE adds 2 = 6
    expect(config.effectiveRoomCount).toBe(6);
  });

  it('resolves a contract with multiple modifiers', () => {
    const config = buildResolvedRunConfig('contract-volcano-descent', 'test-seed');
    expect(config.modifiers.length).toBe(2);
    expect(config.modifiers.some((m) => m.id === 'mod-enraged')).toBe(true);
    expect(config.modifiers.some((m) => m.id === 'mod-elite-surge')).toBe(true);
  });

  it('throws for unknown contract', () => {
    expect(() => buildResolvedRunConfig('bogus', 'x')).toThrow('Unknown contract');
  });
});
