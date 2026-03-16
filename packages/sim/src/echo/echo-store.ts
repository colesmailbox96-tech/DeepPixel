import type { EchoProfileV1 } from '@echo-party/shared';
import { MAX_ECHO_LIBRARY_SIZE } from '@echo-party/shared';

/**
 * In-memory echo library.
 *
 * The library holds up to MAX_ECHO_LIBRARY_SIZE echoes.
 * Persistence is handled by the save adapter layer (IndexedDB);
 * this module provides pure-function operations on the library state.
 */
export interface EchoLibrary {
  echoes: EchoProfileV1[];
  /** ID of the currently equipped Echo (or null) */
  equippedId: string | null;
}

/** Create an empty echo library */
export function createEchoLibrary(): EchoLibrary {
  return { echoes: [], equippedId: null };
}

/**
 * Add an Echo to the library.
 * If the library is full, the oldest Echo is evicted.
 * Returns a new EchoLibrary (pure function).
 */
export function addEcho(library: EchoLibrary, echo: EchoProfileV1): EchoLibrary {
  const echoes = [...library.echoes, echo];
  // Evict oldest if over capacity
  while (echoes.length > MAX_ECHO_LIBRARY_SIZE) {
    const evicted = echoes.shift()!;
    // If the evicted echo was equipped, clear the selection
    if (library.equippedId === evicted.id) {
      return { echoes, equippedId: null };
    }
  }
  return { ...library, echoes };
}

/**
 * Remove an Echo by ID.
 * If the removed Echo was equipped, clears the selection.
 */
export function removeEcho(library: EchoLibrary, echoId: string): EchoLibrary {
  const echoes = library.echoes.filter((e) => e.id !== echoId);
  const equippedId = library.equippedId === echoId ? null : library.equippedId;
  return { echoes, equippedId };
}

/** Equip an Echo by ID. Returns updated library. */
export function equipEcho(library: EchoLibrary, echoId: string): EchoLibrary {
  const exists = library.echoes.some((e) => e.id === echoId);
  if (!exists) return library;
  return { ...library, equippedId: echoId };
}

/** Unequip the currently equipped Echo */
export function unequipEcho(library: EchoLibrary): EchoLibrary {
  return { ...library, equippedId: null };
}

/** Get the currently equipped Echo profile, or null */
export function getEquippedEcho(library: EchoLibrary): EchoProfileV1 | null {
  if (!library.equippedId) return null;
  return library.echoes.find((e) => e.id === library.equippedId) ?? null;
}
