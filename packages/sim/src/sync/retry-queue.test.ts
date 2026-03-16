import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { EchoProfileV1 } from '@echo-party/shared';
import { RetryQueue } from './retry-queue';
import { SyncAdapter } from './sync-adapter';

/** Build a minimal valid EchoProfileV1 for testing */
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

describe('RetryQueue', () => {
  describe('enqueue / size / isEmpty', () => {
    it('starts empty', () => {
      const q = new RetryQueue();
      expect(q.size()).toBe(0);
      expect(q.isEmpty()).toBe(true);
    });

    it('reports size after enqueue', () => {
      const q = new RetryQueue();
      q.enqueue(makeEcho('e1'));
      expect(q.size()).toBe(1);
      expect(q.isEmpty()).toBe(false);
    });

    it('deduplicates by echo.id', () => {
      const q = new RetryQueue();
      q.enqueue(makeEcho('e1'));
      q.enqueue(makeEcho('e1')); // duplicate
      expect(q.size()).toBe(1);
    });

    it('queues multiple unique echoes', () => {
      const q = new RetryQueue();
      q.enqueue(makeEcho('e1'));
      q.enqueue(makeEcho('e2'));
      q.enqueue(makeEcho('e3'));
      expect(q.size()).toBe(3);
    });
  });

  describe('peek', () => {
    it('returns queued echoes in insertion order', () => {
      const q = new RetryQueue();
      q.enqueue(makeEcho('e1'));
      q.enqueue(makeEcho('e2'));
      const echoes = q.peek();
      expect(echoes).toHaveLength(2);
      expect(echoes[0].id).toBe('e1');
      expect(echoes[1].id).toBe('e2');
    });

    it('returns an empty array for an empty queue', () => {
      const q = new RetryQueue();
      expect(q.peek()).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('removes all items', () => {
      const q = new RetryQueue();
      q.enqueue(makeEcho('e1'));
      q.enqueue(makeEcho('e2'));
      q.clear();
      expect(q.size()).toBe(0);
      expect(q.isEmpty()).toBe(true);
    });
  });

  describe('drain', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('returns 0 for an empty queue', async () => {
      const q = new RetryQueue();
      const adapter = new SyncAdapter({ serverUrl: 'http://test-server' });
      const count = await q.drain(adapter);
      expect(count).toBe(0);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('removes successfully uploaded echoes', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, id: 'x' }),
      });

      const q = new RetryQueue();
      q.enqueue(makeEcho('e1'));
      q.enqueue(makeEcho('e2'));

      const adapter = new SyncAdapter({ serverUrl: 'http://test-server' });
      const count = await q.drain(adapter);

      expect(count).toBe(2);
      expect(q.isEmpty()).toBe(true);
    });

    it('keeps offline-failed echoes for later retry', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      const q = new RetryQueue();
      q.enqueue(makeEcho('e1'));

      const adapter = new SyncAdapter({ serverUrl: 'http://test-server' });
      const count = await q.drain(adapter);

      expect(count).toBe(0);
      expect(q.size()).toBe(1); // still queued
    });

    it('discards server-error echoes (not retried)', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ ok: false, error: 'Bad payload' }),
      });

      const q = new RetryQueue();
      q.enqueue(makeEcho('e1'));

      const adapter = new SyncAdapter({ serverUrl: 'http://test-server' });
      const count = await q.drain(adapter);

      expect(count).toBe(0);
      expect(q.isEmpty()).toBe(true); // discarded — don't retry bad data
    });

    it('retries remaining items on subsequent drain calls', async () => {
      // First call: offline
      fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
      // Second call: success
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, id: 'e1' }),
      });

      const q = new RetryQueue();
      q.enqueue(makeEcho('e1'));

      const adapter = new SyncAdapter({ serverUrl: 'http://test-server' });

      const first = await q.drain(adapter);
      expect(first).toBe(0);
      expect(q.size()).toBe(1);

      const second = await q.drain(adapter);
      expect(second).toBe(1);
      expect(q.isEmpty()).toBe(true);
    });

    it('handles mixed success and offline in one drain', async () => {
      // e1 succeeds, e2 is offline
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, id: 'e1' }),
        })
        .mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const q = new RetryQueue();
      q.enqueue(makeEcho('e1'));
      q.enqueue(makeEcho('e2'));

      const adapter = new SyncAdapter({ serverUrl: 'http://test-server' });
      const count = await q.drain(adapter);

      expect(count).toBe(1);
      expect(q.size()).toBe(1); // e2 still queued
      expect(q.peek()[0].id).toBe('e2');
    });
  });
});
