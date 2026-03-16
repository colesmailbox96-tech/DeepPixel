import type { EchoProfileV1 } from '@echo-party/shared';
import {
  SYNC_SERVER_DEFAULT_URL,
  type EchoUploadResponse,
  type EchoPullResponse,
} from '@echo-party/shared';

/**
 * Options for configuring the SyncAdapter.
 */
export interface SyncAdapterOptions {
  /**
   * Base URL of the sync server.
   * Defaults to SYNC_SERVER_DEFAULT_URL (http://localhost:4444).
   */
  serverUrl?: string;
  /**
   * Timeout in milliseconds for each request.
   * Defaults to 5000 ms.
   */
  timeoutMs?: number;
}

/**
 * Result of a sync operation — either success or a typed failure.
 */
export type SyncResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; offline: boolean };

/**
 * SyncAdapter — thin async client for the Echo sync server.
 *
 * Designed to be offline-safe: every method catches network errors and
 * returns a typed failure result instead of throwing.  The caller (game
 * hub, retry queue, etc.) decides how to surface the failure to the user.
 */
export class SyncAdapter {
  private readonly serverUrl: string;
  private readonly timeoutMs: number;

  constructor(options: SyncAdapterOptions = {}) {
    this.serverUrl = options.serverUrl ?? SYNC_SERVER_DEFAULT_URL;
    this.timeoutMs = options.timeoutMs ?? 5000;
  }

  /**
   * Upload a single Echo to the sync server.
   *
   * Returns `{ ok: true, data: { id } }` on success.
   * Returns `{ ok: false, offline: true }` when the server is unreachable.
   * Returns `{ ok: false, offline: false }` on server-side errors.
   */
  async uploadEcho(echo: EchoProfileV1): Promise<SyncResult<EchoUploadResponse>> {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.serverUrl}/echoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ echo }),
        signal: controller.signal,
      });

      clearTimeout(timerId);

      const payload = (await response.json()) as EchoUploadResponse | { ok: false; error: string };
      if (!payload.ok) {
        return { ok: false, error: (payload as { ok: false; error: string }).error, offline: false };
      }
      return { ok: true, data: payload as EchoUploadResponse };
    } catch (err) {
      clearTimeout(timerId);
      const offline = isOfflineError(err);
      const message = err instanceof Error ? err.message : 'Network error';
      return { ok: false, error: message, offline };
    }
  }

  /**
   * Pull all available Echoes from the sync server.
   *
   * Returns `{ ok: true, data: { echoes } }` on success.
   * Returns `{ ok: false, offline: true }` when the server is unreachable.
   */
  async pullEchoes(): Promise<SyncResult<EchoPullResponse>> {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.serverUrl}/echoes`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timerId);

      const payload = (await response.json()) as EchoPullResponse | { ok: false; error: string };
      if (!payload.ok) {
        return { ok: false, error: (payload as { ok: false; error: string }).error, offline: false };
      }
      return { ok: true, data: payload as EchoPullResponse };
    } catch (err) {
      clearTimeout(timerId);
      const offline = isOfflineError(err);
      const message = err instanceof Error ? err.message : 'Network error';
      return { ok: false, error: message, offline };
    }
  }
}

/**
 * Heuristic: classify a fetch error as "offline" (server unreachable) vs
 * "server-side" (response received but had an error status).
 */
function isOfflineError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'AbortError') {
    // Request timed out — treat as offline
    return true;
  }
  if (err instanceof TypeError) {
    // fetch() throws TypeError for network failures ("Failed to fetch", etc.)
    return true;
  }
  return false;
}
