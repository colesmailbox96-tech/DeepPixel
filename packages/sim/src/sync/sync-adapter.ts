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

      if (!response.ok) {
        const error = await parseErrorBody(response);
        return { ok: false, error, offline: false };
      }

      const payload = await parseJsonSafe<EchoUploadResponse | { ok: false; error: string }>(
        response,
      );
      if (!payload) {
        return { ok: false, error: 'Failed to parse server response', offline: false };
      }
      if (!payload.ok) {
        return { ok: false, error: payload.error, offline: false };
      }
      return { ok: true, data: payload };
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

      if (!response.ok) {
        const error = await parseErrorBody(response);
        return { ok: false, error, offline: false };
      }

      const payload = await parseJsonSafe<EchoPullResponse | { ok: false; error: string }>(
        response,
      );
      if (!payload) {
        return { ok: false, error: 'Failed to parse server response', offline: false };
      }
      if (!payload.ok) {
        return { ok: false, error: payload.error, offline: false };
      }
      return { ok: true, data: payload };
    } catch (err) {
      clearTimeout(timerId);
      const offline = isOfflineError(err);
      const message = err instanceof Error ? err.message : 'Network error';
      return { ok: false, error: message, offline };
    }
  }
}

/**
 * Attempt to parse a Response body as JSON.
 * Returns null when the body is not valid JSON (e.g. HTML proxy error page).
 */
async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Extract a human-readable error message from a non-OK HTTP response.
 * Tries JSON first (server error envelope), falls back to plain text.
 */
async function parseErrorBody(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? `Server error ${response.status}`;
  } catch {
    try {
      const text = await response.text();
      return text.trim() || `Server error ${response.status}`;
    } catch {
      return `Server error ${response.status}`;
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

