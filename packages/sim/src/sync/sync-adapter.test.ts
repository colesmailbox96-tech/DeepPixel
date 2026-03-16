import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { EchoProfileV1 } from '@echo-party/shared';
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

describe('SyncAdapter.uploadEcho', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns ok:true on successful upload', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, id: 'e1' }),
    });

    const adapter = new SyncAdapter({ serverUrl: 'http://test-server' });
    const result = await adapter.uploadEcho(makeEcho('e1'));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.id).toBe('e1');
    }
  });

  it('posts to /echoes with correct JSON body', async () => {
    const echo = makeEcho('e42');
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, id: 'e42' }),
    });

    const adapter = new SyncAdapter({ serverUrl: 'http://test-server' });
    await adapter.uploadEcho(echo);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://test-server/echoes');
    expect(options.method).toBe('POST');
    const parsed = JSON.parse(options.body as string) as { echo: EchoProfileV1 };
    expect(parsed.echo.id).toBe('e42');
  });

  it('returns ok:false with offline:true on TypeError (network failure)', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const adapter = new SyncAdapter({ serverUrl: 'http://test-server' });
    const result = await adapter.uploadEcho(makeEcho('e1'));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.offline).toBe(true);
    }
  });

  it('returns ok:false with offline:true on AbortError (timeout)', async () => {
    const err = new DOMException('Aborted', 'AbortError');
    fetchMock.mockRejectedValueOnce(err);

    const adapter = new SyncAdapter({ serverUrl: 'http://test-server', timeoutMs: 1 });
    const result = await adapter.uploadEcho(makeEcho('e1'));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.offline).toBe(true);
    }
  });

  it('returns ok:false with offline:false on server error response', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ ok: false, error: 'Invalid echo' }),
      text: async () => '{"ok":false,"error":"Invalid echo"}',
    });

    const adapter = new SyncAdapter({ serverUrl: 'http://test-server' });
    const result = await adapter.uploadEcho(makeEcho('e1'));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.offline).toBe(false);
      expect(result.error).toBe('Invalid echo');
    }
  });

  it('returns ok:false with offline:false on non-JSON error body (proxy/HTML error)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
      text: async () => '<html>Bad Gateway</html>',
    });

    const adapter = new SyncAdapter({ serverUrl: 'http://test-server' });
    const result = await adapter.uploadEcho(makeEcho('e1'));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.offline).toBe(false);
      expect(result.error).toContain('Bad Gateway');
    }
  });

  it('returns ok:false with offline:false when success response body is not JSON', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    });

    const adapter = new SyncAdapter({ serverUrl: 'http://test-server' });
    const result = await adapter.uploadEcho(makeEcho('e1'));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.offline).toBe(false);
      expect(result.error).toBe('Failed to parse server response');
    }
  });
});

describe('SyncAdapter.pullEchoes', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns ok:true with echoes array on success', async () => {
    const echoes = [makeEcho('e1'), makeEcho('e2')];
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, echoes }),
    });

    const adapter = new SyncAdapter({ serverUrl: 'http://test-server' });
    const result = await adapter.pullEchoes();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.echoes).toHaveLength(2);
      expect(result.data.echoes[0].id).toBe('e1');
    }
  });

  it('returns ok:true with empty array when no echoes on server', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, echoes: [] }),
    });

    const adapter = new SyncAdapter({ serverUrl: 'http://test-server' });
    const result = await adapter.pullEchoes();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.echoes).toHaveLength(0);
    }
  });

  it('returns ok:false with offline:true on network failure', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network error'));

    const adapter = new SyncAdapter({ serverUrl: 'http://test-server' });
    const result = await adapter.pullEchoes();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.offline).toBe(true);
    }
  });

  it('returns ok:false with offline:false on non-JSON error body (proxy/HTML error)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
      text: async () => 'Service Unavailable',
    });

    const adapter = new SyncAdapter({ serverUrl: 'http://test-server' });
    const result = await adapter.pullEchoes();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.offline).toBe(false);
      expect(result.error).toContain('Service Unavailable');
    }
  });

  it('uses GET method for /echoes', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, echoes: [] }),
    });

    const adapter = new SyncAdapter({ serverUrl: 'http://test-server' });
    await adapter.pullEchoes();

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://test-server/echoes');
    expect(options.method).toBe('GET');
  });

  it('uses the configured serverUrl', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, echoes: [] }),
    });

    const adapter = new SyncAdapter({ serverUrl: 'http://custom-host:9999' });
    await adapter.pullEchoes();

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe('http://custom-host:9999/echoes');
  });
});
