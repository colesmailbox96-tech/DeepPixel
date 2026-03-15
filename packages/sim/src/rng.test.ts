import { describe, it, expect } from 'vitest';
import { SeededRng } from './rng';

describe('SeededRng', () => {
  it('produces deterministic output for the same seed', () => {
    const rng1 = new SeededRng('test-seed');
    const rng2 = new SeededRng('test-seed');

    const results1 = Array.from({ length: 10 }, () => rng1.next());
    const results2 = Array.from({ length: 10 }, () => rng2.next());

    expect(results1).toEqual(results2);
  });

  it('produces different output for different seeds', () => {
    const rng1 = new SeededRng('seed-a');
    const rng2 = new SeededRng('seed-b');

    const results1 = Array.from({ length: 10 }, () => rng1.next());
    const results2 = Array.from({ length: 10 }, () => rng2.next());

    expect(results1).not.toEqual(results2);
  });

  it('next() returns values in [0, 1)', () => {
    const rng = new SeededRng('range-test');
    for (let i = 0; i < 1000; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('nextInt() returns integers in the specified range', () => {
    const rng = new SeededRng('int-test');
    for (let i = 0; i < 100; i++) {
      const val = rng.nextInt(1, 6);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(6);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('pick() returns elements from the array', () => {
    const rng = new SeededRng('pick-test');
    const items = ['a', 'b', 'c', 'd'] as const;
    for (let i = 0; i < 50; i++) {
      const val = rng.pick(items);
      expect(items).toContain(val);
    }
  });

  it('pick() throws on an empty array', () => {
    const rng = new SeededRng('pick-empty-test');
    expect(() => rng.pick([])).toThrow(RangeError);
  });

  it('shuffle() is deterministic for the same seed', () => {
    const rng1 = new SeededRng('shuffle-test');
    const rng2 = new SeededRng('shuffle-test');

    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8];
    const arr2 = [1, 2, 3, 4, 5, 6, 7, 8];

    rng1.shuffle(arr1);
    rng2.shuffle(arr2);

    expect(arr1).toEqual(arr2);
  });

  it('shuffle() mutates the array in place', () => {
    const rng = new SeededRng('mutate-test');
    const arr = [1, 2, 3, 4, 5];
    const returned = rng.shuffle(arr);
    expect(returned).toBe(arr);
  });
});
