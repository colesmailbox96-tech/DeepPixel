import {
  SAVE_SCHEMA_VERSION,
  type SaveEnvelope,
  type SaveSlotData,
  type MetaProgression,
  defaultMetaProgression,
} from '@echo-party/shared';
import {
  serializeSaveSlot,
  deserializeSaveSlot,
  serializeMeta,
  deserializeMeta,
} from './save-serializer';
import { migrateSave } from './migrations';

const DB_NAME = 'echo-party-saves';
const DB_VERSION = 1;

/** Object store names */
const STORE_SLOTS = 'save-slots';
const STORE_META = 'meta';

/** Meta-progression key (there is only one) */
const META_KEY = 'progression';

/**
 * Open (or create) the IndexedDB database.
 */
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_SLOTS)) {
        db.createObjectStore(STORE_SLOTS, { keyPath: 'payload.slotId' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generic helper: put a value into a store.
 * Resolves on tx.oncomplete so the write is guaranteed committed.
 */
function putRecord(db: IDBDatabase, store: string, value: unknown, key?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const os = tx.objectStore(store);
    if (key !== undefined) {
      os.put(value, key);
    } else {
      os.put(value);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Transaction failed'));
    tx.onabort = () => reject(tx.error ?? new Error('Transaction aborted'));
  });
}

/**
 * Generic helper: get a value from a store by key.
 */
function getRecord<T>(db: IDBDatabase, store: string, key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const os = tx.objectStore(store);
    const req = os.get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Generic helper: get all values from a store.
 */
function getAllRecords<T>(db: IDBDatabase, store: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const os = tx.objectStore(store);
    const req = os.getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Generic helper: delete a record from a store.
 * Resolves on tx.oncomplete so the delete is guaranteed committed.
 */
function deleteRecord(db: IDBDatabase, store: string, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const os = tx.objectStore(store);
    os.delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Transaction failed'));
    tx.onabort = () => reject(tx.error ?? new Error('Transaction aborted'));
  });
}

// ── Public API ──────────────────────────────────────────────────

/**
 * Save Adapter: high-level CRUD for save slots and meta-progression using IndexedDB.
 */
export class SaveAdapter {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = openDb();
  }

  // ── Save Slots ────────────────────────────────────────────────

  /** Persist a save slot */
  async saveSlot(slot: SaveSlotData): Promise<void> {
    const db = await this.dbPromise;
    const envelope = serializeSaveSlot(slot);
    await putRecord(db, STORE_SLOTS, envelope);
  }

  /** Load a single save slot by ID. Returns null if not found. */
  async loadSlot(slotId: string): Promise<SaveSlotData | null> {
    const db = await this.dbPromise;
    const raw = await getRecord<SaveEnvelope<SaveSlotData>>(db, STORE_SLOTS, slotId);
    if (!raw) return null;

    // Always run through migrateSave() when versions differ — it handles both
    // older saves (runs migrations) and future saves (throws friendly error).
    const migrated = raw.version !== SAVE_SCHEMA_VERSION ? migrateSave(raw) : raw;
    return deserializeSaveSlot(migrated as SaveEnvelope<SaveSlotData>);
  }

  /** List all save slots */
  async listSlots(): Promise<SaveSlotData[]> {
    const db = await this.dbPromise;
    const raw = await getAllRecords<SaveEnvelope<SaveSlotData>>(db, STORE_SLOTS);
    return raw.map((envelope) => {
      const migrated = envelope.version !== SAVE_SCHEMA_VERSION ? migrateSave(envelope) : envelope;
      return deserializeSaveSlot(migrated as SaveEnvelope<SaveSlotData>);
    });
  }

  /** Delete a save slot */
  async deleteSlot(slotId: string): Promise<void> {
    const db = await this.dbPromise;
    await deleteRecord(db, STORE_SLOTS, slotId);
  }

  // ── Meta Progression ──────────────────────────────────────────

  /** Persist meta-progression */
  async saveMeta(meta: MetaProgression): Promise<void> {
    const db = await this.dbPromise;
    const envelope = serializeMeta(meta);
    await putRecord(db, STORE_META, envelope, META_KEY);
  }

  /** Load meta-progression. Returns a default if none exists. */
  async loadMeta(): Promise<MetaProgression> {
    const db = await this.dbPromise;
    const raw = await getRecord<SaveEnvelope<MetaProgression>>(db, STORE_META, META_KEY);
    if (!raw) return defaultMetaProgression();

    // Always run through migrateSave() when versions differ — it handles both
    // older saves (runs migrations) and future saves (throws friendly error).
    const migrated = raw.version !== SAVE_SCHEMA_VERSION ? migrateSave(raw) : raw;
    return deserializeMeta(migrated as SaveEnvelope<MetaProgression>);
  }

  /** Close the database connection (useful for tests) */
  async close(): Promise<void> {
    const db = await this.dbPromise;
    db.close();
  }
}

/** Database name exported for testing / clearing */
export { DB_NAME };
