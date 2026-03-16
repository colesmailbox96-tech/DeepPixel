import { describe, it, expect } from 'vitest';
import { MAX_ECHO_LIBRARY_SIZE } from '@echo-party/shared';
import type { EchoProfileV1 } from '@echo-party/shared';
import {
  createEchoLibrary,
  addEcho,
  removeEcho,
  equipEcho,
  unequipEcho,
  getEquippedEcho,
} from './echo-store';

function makeEcho(id: string): EchoProfileV1 {
  return {
    version: 1,
    id,
    name: `Echo ${id}`,
    createdAt: new Date().toISOString(),
    sourceSeed: `seed-${id}`,
    aggression: 0.5,
    movementBias: {},
    keepDistance: 0.3,
    targetSelection: {},
    abilityPriority: 0.5,
    survivabilityBias: 0.5,
  };
}

describe('createEchoLibrary', () => {
  it('creates an empty library', () => {
    const lib = createEchoLibrary();
    expect(lib.echoes).toHaveLength(0);
    expect(lib.equippedId).toBeNull();
  });
});

describe('addEcho', () => {
  it('adds an Echo to the library', () => {
    let lib = createEchoLibrary();
    lib = addEcho(lib, makeEcho('e1'));
    expect(lib.echoes).toHaveLength(1);
    expect(lib.echoes[0].id).toBe('e1');
  });

  it('does not mutate the original library', () => {
    const lib = createEchoLibrary();
    const lib2 = addEcho(lib, makeEcho('e1'));
    expect(lib.echoes).toHaveLength(0);
    expect(lib2.echoes).toHaveLength(1);
  });

  it('evicts the oldest Echo when over capacity', () => {
    let lib = createEchoLibrary();
    for (let i = 0; i < MAX_ECHO_LIBRARY_SIZE; i++) {
      lib = addEcho(lib, makeEcho(`e${i}`));
    }
    expect(lib.echoes).toHaveLength(MAX_ECHO_LIBRARY_SIZE);

    // Add one more — oldest (e0) should be evicted
    lib = addEcho(lib, makeEcho('new'));
    expect(lib.echoes).toHaveLength(MAX_ECHO_LIBRARY_SIZE);
    expect(lib.echoes[0].id).toBe('e1');
    expect(lib.echoes[lib.echoes.length - 1].id).toBe('new');
  });

  it('clears equippedId if the evicted Echo was equipped', () => {
    let lib = createEchoLibrary();
    for (let i = 0; i < MAX_ECHO_LIBRARY_SIZE; i++) {
      lib = addEcho(lib, makeEcho(`e${i}`));
    }
    lib = equipEcho(lib, 'e0');
    expect(lib.equippedId).toBe('e0');

    // Evict e0
    lib = addEcho(lib, makeEcho('overflow'));
    expect(lib.equippedId).toBeNull();
  });
});

describe('removeEcho', () => {
  it('removes an Echo by ID', () => {
    let lib = createEchoLibrary();
    lib = addEcho(lib, makeEcho('e1'));
    lib = addEcho(lib, makeEcho('e2'));
    lib = removeEcho(lib, 'e1');
    expect(lib.echoes).toHaveLength(1);
    expect(lib.echoes[0].id).toBe('e2');
  });

  it('clears equippedId if the removed Echo was equipped', () => {
    let lib = createEchoLibrary();
    lib = addEcho(lib, makeEcho('e1'));
    lib = equipEcho(lib, 'e1');
    lib = removeEcho(lib, 'e1');
    expect(lib.equippedId).toBeNull();
  });

  it('preserves equippedId if a different Echo was removed', () => {
    let lib = createEchoLibrary();
    lib = addEcho(lib, makeEcho('e1'));
    lib = addEcho(lib, makeEcho('e2'));
    lib = equipEcho(lib, 'e1');
    lib = removeEcho(lib, 'e2');
    expect(lib.equippedId).toBe('e1');
  });
});

describe('equipEcho / unequipEcho', () => {
  it('equips an existing Echo', () => {
    let lib = createEchoLibrary();
    lib = addEcho(lib, makeEcho('e1'));
    lib = equipEcho(lib, 'e1');
    expect(lib.equippedId).toBe('e1');
  });

  it('ignores equip for non-existent Echo', () => {
    let lib = createEchoLibrary();
    lib = equipEcho(lib, 'nonexistent');
    expect(lib.equippedId).toBeNull();
  });

  it('unequips the current Echo', () => {
    let lib = createEchoLibrary();
    lib = addEcho(lib, makeEcho('e1'));
    lib = equipEcho(lib, 'e1');
    lib = unequipEcho(lib);
    expect(lib.equippedId).toBeNull();
  });
});

describe('getEquippedEcho', () => {
  it('returns the equipped Echo profile', () => {
    let lib = createEchoLibrary();
    lib = addEcho(lib, makeEcho('e1'));
    lib = equipEcho(lib, 'e1');
    const echo = getEquippedEcho(lib);
    expect(echo).not.toBeNull();
    expect(echo!.id).toBe('e1');
  });

  it('returns null when nothing is equipped', () => {
    const lib = createEchoLibrary();
    expect(getEquippedEcho(lib)).toBeNull();
  });

  it('returns null if equipped ID no longer exists', () => {
    let lib = createEchoLibrary();
    lib = addEcho(lib, makeEcho('e1'));
    lib = equipEcho(lib, 'e1');
    lib = removeEcho(lib, 'e1');
    expect(getEquippedEcho(lib)).toBeNull();
  });
});
