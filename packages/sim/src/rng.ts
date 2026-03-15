/**
 * Deterministic seeded random number generator (mulberry32).
 *
 * All gameplay randomness MUST go through an instance of SeededRng
 * so that runs are reproducible given the same seed.
 */
export class SeededRng {
  private state: number;

  constructor(seed: string) {
    this.state = SeededRng.hashSeed(seed);
  }

  /** Hash a string seed into a 32-bit integer */
  private static hashSeed(seed: string): number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(31, h) + seed.charCodeAt(i);
      h |= 0; // Convert to 32-bit integer
    }
    return h >>> 0;
  }

  /** Return next float in [0, 1) */
  next(): number {
    this.state += 0x6d2b79f5;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Return an integer in [min, max] inclusive */
  nextInt(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** Return a random element from an array */
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  /** Shuffle an array in place (Fisher-Yates) */
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
