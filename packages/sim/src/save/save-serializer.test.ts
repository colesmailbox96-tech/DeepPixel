import { describe, it, expect } from 'vitest';
import { Difficulty, SAVE_SCHEMA_VERSION, defaultMetaProgression } from '@echo-party/shared';
import type { MetaProgression, SaveSlotData } from '@echo-party/shared';
import { createRunState, type RunState } from '../run-state';
import {
  serializeRunState,
  deserializeRunState,
  wrapEnvelope,
  unwrapEnvelope,
  createEmptySlot,
  serializeSaveSlot,
  deserializeSaveSlot,
  serializeMeta,
  deserializeMeta,
  parseSaveJson,
} from './save-serializer';

function makeRunState(): RunState {
  return createRunState({
    seed: 'test-seed-42',
    difficulty: Difficulty.Hard,
    contractId: 'contract-sewer-sweep',
  });
}

describe('save-serializer', () => {
  describe('serializeRunState / deserializeRunState', () => {
    it('round-trips a fresh RunState', () => {
      const original = makeRunState();
      original.currentRoom = 2;
      original.totalRooms = 5;
      original.enemiesDefeated = 3;
      original.damageDealt = 120;
      original.damageTaken = 45;
      original.itemsCollected = 2;

      const serialized = serializeRunState(original);
      const restored = deserializeRunState(serialized);

      expect(restored.config.seed).toBe(original.config.seed);
      expect(restored.config.difficulty).toBe(original.config.difficulty);
      expect(restored.config.contractId).toBe(original.config.contractId);
      expect(restored.currentRoom).toBe(2);
      expect(restored.totalRooms).toBe(5);
      expect(restored.player.maxHp).toBe(original.player.maxHp);
      expect(restored.player.currentHp).toBe(original.player.currentHp);
      expect(restored.player.attack).toBe(original.player.attack);
      expect(restored.player.defense).toBe(original.player.defense);
      expect(restored.player.speed).toBe(original.player.speed);
      expect(restored.enemiesDefeated).toBe(3);
      expect(restored.damageDealt).toBe(120);
      expect(restored.damageTaken).toBe(45);
      expect(restored.itemsCollected).toBe(2);
      expect(restored.completed).toBe(false);
      expect(restored.victory).toBe(false);
    });

    it('preserves completed/victory flags', () => {
      const run = makeRunState();
      run.completed = true;
      run.victory = true;

      const restored = deserializeRunState(serializeRunState(run));
      expect(restored.completed).toBe(true);
      expect(restored.victory).toBe(true);
    });

    it('serialized form contains flat fields, no nested config', () => {
      const serialized = serializeRunState(makeRunState());
      expect(serialized).toHaveProperty('seed');
      expect(serialized).toHaveProperty('difficulty');
      expect(serialized).toHaveProperty('playerMaxHp');
      expect(serialized).not.toHaveProperty('config');
      expect(serialized).not.toHaveProperty('player');
    });
  });

  describe('wrapEnvelope / unwrapEnvelope', () => {
    it('wraps with current version and timestamp', () => {
      const envelope = wrapEnvelope({ foo: 'bar' });
      expect(envelope.version).toBe(SAVE_SCHEMA_VERSION);
      expect(envelope.timestamp).toBeGreaterThan(0);
      expect(envelope.payload).toEqual({ foo: 'bar' });
    });

    it('unwraps matching version', () => {
      const envelope = wrapEnvelope(42);
      expect(unwrapEnvelope(envelope)).toBe(42);
    });

    it('throws on version mismatch', () => {
      const envelope = wrapEnvelope('data');
      envelope.version = 999;
      expect(() => unwrapEnvelope(envelope)).toThrow('Save version mismatch');
    });
  });

  describe('createEmptySlot', () => {
    it('creates a slot with null runState and valid timestamps', () => {
      const slot = createEmptySlot('slot-1', 'Test Slot');
      expect(slot.slotId).toBe('slot-1');
      expect(slot.name).toBe('Test Slot');
      expect(slot.runState).toBeNull();
      expect(new Date(slot.createdAt).getTime()).toBeGreaterThan(0);
      expect(slot.updatedAt).toBe(slot.createdAt);
    });
  });

  describe('serializeSaveSlot / deserializeSaveSlot', () => {
    it('round-trips a save slot with run state', () => {
      const slot: SaveSlotData = {
        slotId: 'slot-2',
        name: 'My Run',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        runState: serializeRunState(makeRunState()),
      };

      const envelope = serializeSaveSlot(slot);
      expect(envelope.version).toBe(SAVE_SCHEMA_VERSION);

      const restored = deserializeSaveSlot(envelope);
      expect(restored.slotId).toBe('slot-2');
      expect(restored.name).toBe('My Run');
      expect(restored.runState).not.toBeNull();
      expect(restored.runState!.seed).toBe('test-seed-42');
    });
  });

  describe('serializeMeta / deserializeMeta', () => {
    it('round-trips meta progression', () => {
      const meta: MetaProgression = {
        totalRuns: 5,
        totalVictories: 3,
        lifetimeEnemiesDefeated: 42,
        lifetimeDamageDealt: 999,
        runHistory: [],
      };

      const envelope = serializeMeta(meta);
      const restored = deserializeMeta(envelope);
      expect(restored).toEqual(meta);
    });

    it('round-trips default meta progression', () => {
      const meta = defaultMetaProgression();
      const envelope = serializeMeta(meta);
      const restored = deserializeMeta(envelope);
      expect(restored).toEqual(meta);
    });
  });

  describe('parseSaveJson', () => {
    it('parses valid JSON envelope', () => {
      const envelope = wrapEnvelope({ test: true });
      const json = JSON.stringify(envelope);
      const parsed = parseSaveJson(json);
      expect(parsed).not.toBeNull();
      expect(parsed!.version).toBe(SAVE_SCHEMA_VERSION);
    });

    it('returns null for invalid JSON', () => {
      expect(parseSaveJson('not json')).toBeNull();
    });

    it('returns null for JSON missing version', () => {
      expect(parseSaveJson('{"payload": {}}')).toBeNull();
    });

    it('returns null for JSON missing payload', () => {
      expect(parseSaveJson('{"version": 1}')).toBeNull();
    });
  });
});
