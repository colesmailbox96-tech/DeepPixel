import { describe, it, expect } from 'vitest';
import { Direction } from '@echo-party/shared';
import { createActionLog, recordAction } from './action-log';
import { distillEcho } from './distill';

describe('distillEcho', () => {
  it('returns an empty profile when the log is empty', () => {
    const log = createActionLog();
    const echo = distillEcho(log, 'seed-1', 'echo-1', 'Test Echo');

    expect(echo.version).toBe(1);
    expect(echo.id).toBe('echo-1');
    expect(echo.sourceSeed).toBe('seed-1');
    expect(echo.aggression).toBe(0);
    expect(echo.keepDistance).toBe(0.5);
    expect(echo.survivabilityBias).toBe(0.5);
  });

  it('computes high aggression for attack-heavy logs', () => {
    const log = createActionLog();
    // 8 attacks, 2 moves
    for (let i = 0; i < 8; i++) {
      recordAction(log, { type: 'attack' }, { x: 5, y: 5 }, [{ x: 6, y: 5 }], ['slime'], null);
    }
    for (let i = 0; i < 2; i++) {
      recordAction(log, { type: 'move', dx: 1, dy: 0 }, { x: 5, y: 5 }, [{ x: 6, y: 5 }], ['slime'], null);
    }

    const echo = distillEcho(log, 'seed-1', 'echo-1', 'Aggressive');
    expect(echo.aggression).toBe(0.8);
    expect(echo.abilityPriority).toBe(0.8);
  });

  it('computes low aggression for move-heavy logs', () => {
    const log = createActionLog();
    // 1 attack, 9 moves
    recordAction(log, { type: 'attack' }, { x: 5, y: 5 }, [{ x: 6, y: 5 }], ['slime'], null);
    for (let i = 0; i < 9; i++) {
      recordAction(log, { type: 'move', dx: 1, dy: 0 }, { x: 5, y: 5 }, [{ x: 6, y: 5 }], ['slime'], null);
    }

    const echo = distillEcho(log, 'seed-1', 'echo-1', 'Passive');
    expect(echo.aggression).toBe(0.1);
  });

  it('captures movement bias from directional moves', () => {
    const log = createActionLog();
    // 6 east moves, 4 north moves
    for (let i = 0; i < 6; i++) {
      recordAction(log, { type: 'move', dx: 1, dy: 0 }, { x: i, y: 5 }, [], [], null);
    }
    for (let i = 0; i < 4; i++) {
      recordAction(log, { type: 'move', dx: 0, dy: -1 }, { x: 5, y: 5 - i }, [], [], null);
    }

    const echo = distillEcho(log, 'seed-1', 'echo-1', 'Eastward');
    expect(echo.movementBias[Direction.East]).toBe(0.6);
    expect(echo.movementBias[Direction.North]).toBe(0.4);
  });

  it('computes keepDistance based on enemy proximity', () => {
    const log = createActionLog();
    // Player always far from enemies (distance ~8)
    for (let i = 0; i < 10; i++) {
      recordAction(log, { type: 'move', dx: 1, dy: 0 }, { x: 2, y: 5 }, [{ x: 10, y: 5 }], ['archer'], null);
    }

    const echo = distillEcho(log, 'seed-1', 'echo-1', 'Ranged');
    expect(echo.keepDistance).toBeGreaterThan(0.5);
  });

  it('computes low keepDistance when always adjacent', () => {
    const log = createActionLog();
    // Player always adjacent to enemy (distance 1)
    for (let i = 0; i < 10; i++) {
      recordAction(log, { type: 'attack' }, { x: 5, y: 5 }, [{ x: 6, y: 5 }], ['slime'], null);
    }

    const echo = distillEcho(log, 'seed-1', 'echo-1', 'Melee');
    expect(echo.keepDistance).toBeLessThan(0.2);
  });

  it('captures target selection preferences', () => {
    const log = createActionLog();
    // Kill 3 goblins and 1 slime
    for (let i = 0; i < 3; i++) {
      recordAction(log, { type: 'attack' }, { x: 5, y: 5 }, [{ x: 6, y: 5 }], ['goblin'], 'goblin');
    }
    recordAction(log, { type: 'attack' }, { x: 5, y: 5 }, [{ x: 6, y: 5 }], ['slime'], 'slime');

    const echo = distillEcho(log, 'seed-1', 'echo-1', 'GoblinSlayer');
    expect(echo.targetSelection['goblin']).toBe(0.75);
    expect(echo.targetSelection['slime']).toBe(0.25);
  });

  it('computes high survivability for evasive players', () => {
    const log = createActionLog();
    // Player always far from enemies
    for (let i = 0; i < 10; i++) {
      recordAction(log, { type: 'move', dx: -1, dy: 0 }, { x: 2, y: 5 }, [{ x: 10, y: 5 }], ['brute'], null);
    }

    const echo = distillEcho(log, 'seed-1', 'echo-1', 'Evasive');
    expect(echo.survivabilityBias).toBeGreaterThan(0.5);
  });

  it('computes low survivability for tanky players', () => {
    const log = createActionLog();
    // Player always adjacent to enemies
    for (let i = 0; i < 10; i++) {
      recordAction(log, { type: 'attack' }, { x: 5, y: 5 }, [{ x: 6, y: 5 }], ['brute'], null);
    }

    const echo = distillEcho(log, 'seed-1', 'echo-1', 'Tanky');
    expect(echo.survivabilityBias).toBeLessThan(0.3);
  });

  it('produces a valid EchoProfileV1 shape', () => {
    const log = createActionLog();
    for (let i = 0; i < 5; i++) {
      recordAction(log, { type: 'attack' }, { x: 5, y: 5 }, [{ x: 6, y: 5 }], ['slime'], i === 4 ? 'slime' : null);
      recordAction(log, { type: 'move', dx: 1, dy: 0 }, { x: 5, y: 5 }, [{ x: 6, y: 5 }], ['slime'], null);
    }

    const echo = distillEcho(log, 'seed-1', 'echo-1', 'Balanced');
    expect(echo.version).toBe(1);
    expect(echo.id).toBe('echo-1');
    expect(echo.name).toBe('Balanced');
    expect(echo.sourceSeed).toBe('seed-1');
    expect(typeof echo.aggression).toBe('number');
    expect(typeof echo.keepDistance).toBe('number');
    expect(typeof echo.abilityPriority).toBe('number');
    expect(typeof echo.survivabilityBias).toBe('number');
    expect(echo.aggression).toBeGreaterThanOrEqual(0);
    expect(echo.aggression).toBeLessThanOrEqual(1);
    expect(echo.keepDistance).toBeGreaterThanOrEqual(0);
    expect(echo.keepDistance).toBeLessThanOrEqual(1);
  });
});
