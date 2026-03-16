import {
  SAVE_SCHEMA_VERSION,
  type SaveEnvelope,
  type SerializedRunState,
  type SaveSlotData,
  type MetaProgression,
  defaultMetaProgression,
} from '@echo-party/shared';
import type { RunState } from '../run-state';

/** Serialize a RunState into its storage-friendly form */
export function serializeRunState(run: RunState): SerializedRunState {
  return {
    seed: run.config.seed,
    difficulty: run.config.difficulty,
    contractId: run.config.contractId,
    currentRoom: run.currentRoom,
    totalRooms: run.totalRooms,
    playerMaxHp: run.player.maxHp,
    playerCurrentHp: run.player.currentHp,
    playerAttack: run.player.attack,
    playerDefense: run.player.defense,
    playerSpeed: run.player.speed,
    enemiesDefeated: run.enemiesDefeated,
    damageDealt: run.damageDealt,
    damageTaken: run.damageTaken,
    itemsCollected: run.itemsCollected,
    completed: run.completed,
    victory: run.victory,
  };
}

/** Deserialize a SerializedRunState back into a RunState */
export function deserializeRunState(data: SerializedRunState): RunState {
  return {
    config: {
      seed: data.seed,
      difficulty: data.difficulty,
      contractId: data.contractId,
    },
    currentRoom: data.currentRoom,
    totalRooms: data.totalRooms,
    player: {
      maxHp: data.playerMaxHp,
      currentHp: data.playerCurrentHp,
      attack: data.playerAttack,
      defense: data.playerDefense,
      speed: data.playerSpeed,
    },
    enemiesDefeated: data.enemiesDefeated,
    damageDealt: data.damageDealt,
    damageTaken: data.damageTaken,
    itemsCollected: data.itemsCollected,
    completed: data.completed,
    victory: data.victory,
  };
}

/** Wrap any payload in a versioned SaveEnvelope */
export function wrapEnvelope<T>(payload: T): SaveEnvelope<T> {
  return {
    version: SAVE_SCHEMA_VERSION,
    timestamp: Date.now(),
    payload,
  };
}

/** Unwrap a SaveEnvelope, returning the payload.
 *  Throws if the version is unrecognised (migration must be applied first). */
export function unwrapEnvelope<T>(envelope: SaveEnvelope<T>): T {
  if (envelope.version !== SAVE_SCHEMA_VERSION) {
    throw new Error(
      `Save version mismatch: expected ${SAVE_SCHEMA_VERSION}, got ${envelope.version}`,
    );
  }
  return envelope.payload;
}

/** Create a fresh SaveSlotData for a given slot ID */
export function createEmptySlot(slotId: string, name: string): SaveSlotData {
  const now = new Date().toISOString();
  return {
    slotId,
    name,
    createdAt: now,
    updatedAt: now,
    runState: null,
  };
}

/** Serialize a save slot into a versioned envelope */
export function serializeSaveSlot(slot: SaveSlotData): SaveEnvelope<SaveSlotData> {
  return wrapEnvelope(slot);
}

/** Deserialize a save slot envelope */
export function deserializeSaveSlot(envelope: SaveEnvelope<SaveSlotData>): SaveSlotData {
  return unwrapEnvelope(envelope);
}

/** Serialize meta progression into a versioned envelope */
export function serializeMeta(meta: MetaProgression): SaveEnvelope<MetaProgression> {
  return wrapEnvelope(meta);
}

/** Deserialize meta progression envelope */
export function deserializeMeta(envelope: SaveEnvelope<MetaProgression>): MetaProgression {
  return unwrapEnvelope(envelope);
}

/** Parse raw JSON string into a SaveEnvelope.
 *  Returns null if the string is not valid JSON. */
export function parseSaveJson<T = unknown>(json: string): SaveEnvelope<T> | null {
  try {
    const parsed = JSON.parse(json) as SaveEnvelope<T>;
    if (typeof parsed.version !== 'number' || parsed.payload === undefined) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Produce a default MetaProgression (re-exported for convenience) */
export { defaultMetaProgression };
