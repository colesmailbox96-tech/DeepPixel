import http from 'http';
import type { IncomingMessage, ServerResponse } from 'http';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import type {
  EchoProfileV1,
  EchoUploadRequest,
  EchoUploadResponse,
  EchoPullResponse,
  SyncErrorResponse,
} from '@echo-party/shared';
import { SYNC_SERVER_DEFAULT_PORT } from '@echo-party/shared';

/**
 * In-memory Echo store keyed by Echo ID.
 * This is intentionally ephemeral — a mock, not a real database.
 */
const store = new Map<string, EchoProfileV1>();

/** Read the full request body as a string */
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

/** Send a JSON response */
function sendJson(
  res: ServerResponse,
  status: number,
  payload: EchoUploadResponse | EchoPullResponse | SyncErrorResponse,
): void {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(body);
}

/**
 * Handle an individual request.
 */
async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = req.url ?? '/';
  const method = req.method ?? 'GET';

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    });
    res.end();
    return;
  }

  // POST /echoes — upload an Echo
  if (method === 'POST' && url === '/echoes') {
    let body: string;
    try {
      body = await readBody(req);
    } catch {
      sendJson(res, 400, { ok: false, error: 'Failed to read request body' });
      return;
    }

    let parsed: EchoUploadRequest;
    try {
      parsed = JSON.parse(body) as EchoUploadRequest;
    } catch {
      sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
      return;
    }

    const echo = parsed?.echo;
    if (!echo || typeof echo.id !== 'string') {
      sendJson(res, 422, { ok: false, error: 'Missing or invalid echo.id' });
      return;
    }

    store.set(echo.id, echo);
    sendJson(res, 201, { ok: true, id: echo.id });
    return;
  }

  // GET /echoes — pull all Echoes
  if (method === 'GET' && url === '/echoes') {
    const echoes = Array.from(store.values());
    sendJson(res, 200, { ok: true, echoes });
    return;
  }

  // 404 for anything else
  sendJson(res, 404, { ok: false, error: 'Not found' });
}

/**
 * Create and return the HTTP server without starting it.
 * Useful for testing — callers can listen on any port.
 */
export function createServer(): http.Server {
  return http.createServer((req, res) => {
    handleRequest(req, res).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Internal server error';
      if (!res.headersSent) {
        sendJson(res, 500, { ok: false, error: message });
      }
    });
  });
}

/**
 * Clear all stored Echoes (test helper).
 */
export function clearStore(): void {
  store.clear();
}

/**
 * Get a snapshot of the current store (test helper).
 */
export function getStore(): Map<string, EchoProfileV1> {
  return new Map(store);
}

// Start the server only when this module is executed directly (not imported).
// pathToFileURL(resolve(...)) handles both Unix and Windows paths safely.
const isMain =
  typeof process !== 'undefined' &&
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMain) {
  const port = SYNC_SERVER_DEFAULT_PORT;
  const server = createServer();
  server.listen(port, () => {
    console.log(`[server-mock] Echo sync server listening on http://localhost:${port}`);
    console.log(`[server-mock]   POST /echoes  — upload an Echo`);
    console.log(`[server-mock]   GET  /echoes  — pull all Echoes`);
  });
}
