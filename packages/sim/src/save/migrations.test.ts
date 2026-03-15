import { describe, it, expect } from 'vitest';
import { SAVE_SCHEMA_VERSION, type SaveEnvelope } from '@echo-party/shared';
import { migrateSave, needsMigration } from './migrations';

describe('migrations', () => {
  describe('needsMigration', () => {
    it('returns false when version matches current', () => {
      const envelope: SaveEnvelope = {
        version: SAVE_SCHEMA_VERSION,
        timestamp: Date.now(),
        payload: {},
      };
      expect(needsMigration(envelope)).toBe(false);
    });

    it('returns true when version is older than current', () => {
      const envelope: SaveEnvelope = {
        version: SAVE_SCHEMA_VERSION - 1,
        timestamp: Date.now(),
        payload: {},
      };
      // Only meaningful if version > 0 — when SAVE_SCHEMA_VERSION === 1
      // this creates version 0 which is always < 1
      expect(needsMigration(envelope)).toBe(SAVE_SCHEMA_VERSION > 1 || true);
    });
  });

  describe('migrateSave', () => {
    it('returns envelope unchanged when already at current version', () => {
      const envelope: SaveEnvelope = {
        version: SAVE_SCHEMA_VERSION,
        timestamp: 12345,
        payload: { data: 'test' },
      };
      const result = migrateSave(envelope);
      expect(result.version).toBe(SAVE_SCHEMA_VERSION);
      expect(result.payload).toEqual({ data: 'test' });
    });

    it('throws on future version', () => {
      const envelope: SaveEnvelope = {
        version: SAVE_SCHEMA_VERSION + 1,
        timestamp: Date.now(),
        payload: {},
      };
      expect(() => migrateSave(envelope)).toThrow('newer than supported');
    });

    it('throws on missing migration step', () => {
      // Version 0 has no registered migration → should throw
      const envelope: SaveEnvelope = {
        version: 0,
        timestamp: Date.now(),
        payload: {},
      };
      expect(() => migrateSave(envelope)).toThrow('Missing migration');
    });
  });
});
