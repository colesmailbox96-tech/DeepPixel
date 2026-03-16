import { SAVE_SCHEMA_VERSION, type SaveEnvelope } from '@echo-party/shared';

/**
 * A migration function transforms a save envelope from version N to version N+1.
 * It receives and returns the raw envelope so migrations can reshape any field.
 */
export type MigrationFn = (envelope: SaveEnvelope) => SaveEnvelope;

/**
 * Registry of migrations keyed by the *source* version they upgrade from.
 * e.g., migrations[1] upgrades v1 → v2.
 *
 * When the save format changes, add a new entry here and bump SAVE_SCHEMA_VERSION.
 */
const migrations: Record<number, MigrationFn> = {
  // Example (inactive until SAVE_SCHEMA_VERSION > 1):
  // 1: (env) => {
  //   const payload = env.payload as Record<string, unknown>;
  //   payload.newField = 'defaultValue';
  //   return { ...env, version: 2, payload };
  // },
};

/**
 * Apply all necessary migrations to bring an envelope up to the current schema version.
 * Returns a new envelope at `SAVE_SCHEMA_VERSION`.
 *
 * Throws if a required migration step is missing or the version is ahead of current.
 */
export function migrateSave(envelope: SaveEnvelope): SaveEnvelope {
  let current = { ...envelope };

  if (current.version > SAVE_SCHEMA_VERSION) {
    throw new Error(
      `Save version ${current.version} is newer than supported version ${SAVE_SCHEMA_VERSION}. ` +
        'Please update the game.',
    );
  }

  while (current.version < SAVE_SCHEMA_VERSION) {
    const fn = migrations[current.version];
    if (!fn) {
      throw new Error(
        `Missing migration from version ${current.version} to ${current.version + 1}`,
      );
    }
    current = fn(current);
  }

  return current;
}

/**
 * Check whether an envelope needs migration.
 */
export function needsMigration(envelope: SaveEnvelope): boolean {
  return envelope.version < SAVE_SCHEMA_VERSION;
}
