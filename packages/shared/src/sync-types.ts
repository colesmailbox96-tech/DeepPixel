import type { EchoProfileV1 } from './echo-types';

/**
 * Request body for uploading an Echo to the sync server.
 */
export interface EchoUploadRequest {
  echo: EchoProfileV1;
}

/**
 * Response from a successful Echo upload.
 */
export interface EchoUploadResponse {
  ok: true;
  id: string;
}

/**
 * Response from pulling all available Echoes.
 */
export interface EchoPullResponse {
  ok: true;
  echoes: EchoProfileV1[];
}

/**
 * Generic error response from the sync server.
 */
export interface SyncErrorResponse {
  ok: false;
  error: string;
}

/**
 * Default port the server-mock listens on.
 */
export const SYNC_SERVER_DEFAULT_PORT = 4444;

/**
 * Default base URL for the server-mock when running locally.
 */
export const SYNC_SERVER_DEFAULT_URL = `http://localhost:${SYNC_SERVER_DEFAULT_PORT}`;
