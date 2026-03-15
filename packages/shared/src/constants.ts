/** Game configuration constants */
export const TILE_SIZE = 16;
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;
export const SCALE_FACTOR = 3;

/** Viewport in scaled pixels */
export const VIEWPORT_WIDTH = GAME_WIDTH * SCALE_FACTOR;
export const VIEWPORT_HEIGHT = GAME_HEIGHT * SCALE_FACTOR;

/** Timing constants */
export const TARGET_FPS = 60;
export const FIXED_TIMESTEP_MS = 1000 / TARGET_FPS;

/** Run constraints */
export const MIN_ROOMS_PER_RUN = 3;
export const MAX_ROOMS_PER_RUN = 8;
export const DEFAULT_ROOM_WIDTH = 15;
export const DEFAULT_ROOM_HEIGHT = 11;
