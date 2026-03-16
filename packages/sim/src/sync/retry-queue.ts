import type { EchoProfileV1 } from '@echo-party/shared';
import type { SyncAdapter } from './sync-adapter';

/**
 * A pending item in the retry queue.
 */
interface QueueItem {
  echo: EchoProfileV1;
  /** ISO-8601 timestamp of when this item was enqueued */
  enqueuedAt: string;
  /** Number of upload attempts made so far */
  attempts: number;
}

/**
 * RetryQueue — accumulates Echo uploads that failed due to network issues
 * and replays them when the network becomes available.
 *
 * This is an in-memory queue. Items are lost on page reload; for a
 * persistent queue the caller should combine this with IndexedDB storage.
 *
 * Usage:
 *   const queue = new RetryQueue();
 *   const result = await adapter.uploadEcho(echo);
 *   if (!result.ok && result.offline) queue.enqueue(echo);
 *   // later, when online…
 *   await queue.drain(adapter);
 */
export class RetryQueue {
  private items: QueueItem[] = [];

  /**
   * Add an Echo to the retry queue.
   * Silently deduplicates by echo.id — if the same Echo is already queued
   * the call is a no-op.
   */
  enqueue(echo: EchoProfileV1): void {
    const alreadyQueued = this.items.some((item) => item.echo.id === echo.id);
    if (alreadyQueued) return;
    this.items.push({ echo, enqueuedAt: new Date().toISOString(), attempts: 0 });
  }

  /** Number of items currently in the queue. */
  size(): number {
    return this.items.length;
  }

  /** True when the queue has no pending items. */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Attempt to upload all queued Echoes using the provided SyncAdapter.
   *
   * Items that succeed are removed from the queue.
   * Items that fail due to being offline remain in the queue for future retries.
   * Items that fail with a server-side error (non-offline) are also removed
   * to avoid retrying permanently bad payloads.
   *
   * Returns the number of successfully uploaded items.
   */
  async drain(adapter: SyncAdapter): Promise<number> {
    if (this.isEmpty()) return 0;

    const remaining: QueueItem[] = [];
    let successCount = 0;

    for (const item of this.items) {
      item.attempts += 1;
      const result = await adapter.uploadEcho(item.echo);
      if (result.ok) {
        successCount += 1;
      } else if (result.offline) {
        // Keep in queue — network still unavailable
        remaining.push(item);
      }
      // Server-side errors: discard to avoid infinite retry of bad data
    }

    this.items = remaining;
    return successCount;
  }

  /**
   * Remove all items from the queue.
   */
  clear(): void {
    this.items = [];
  }

  /**
   * Return a read-only snapshot of the queued Echo profiles.
   */
  peek(): readonly EchoProfileV1[] {
    return this.items.map((item) => item.echo);
  }
}
