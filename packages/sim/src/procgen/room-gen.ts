import { DEFAULT_ROOM_WIDTH, DEFAULT_ROOM_HEIGHT } from '@echo-party/shared';
import { SeededRng } from '../rng';

/** Tile types in a generated room */
export enum TileType {
  Floor = 0,
  Wall = 1,
}

/** A generated room layout */
export interface RoomLayout {
  width: number;
  height: number;
  tiles: TileType[][];
}

/**
 * Generate a room layout. The room has walls on the perimeter and floor inside.
 * Uses the RNG for potential future variation (obstacle placement, etc.).
 */
export function generateRoom(rng: SeededRng, width?: number, height?: number): RoomLayout {
  const w = width ?? DEFAULT_ROOM_WIDTH;
  const h = height ?? DEFAULT_ROOM_HEIGHT;

  const tiles: TileType[][] = [];
  for (let y = 0; y < h; y++) {
    const row: TileType[] = [];
    for (let x = 0; x < w; x++) {
      const isWall = x === 0 || x === w - 1 || y === 0 || y === h - 1;
      row.push(isWall ? TileType.Wall : TileType.Floor);
    }
    tiles.push(row);
  }

  // Add random interior obstacles (1-3 wall tiles) for variety
  const obstacleCount = rng.nextInt(1, 3);
  for (let i = 0; i < obstacleCount; i++) {
    const ox = rng.nextInt(2, w - 3);
    const oy = rng.nextInt(2, h - 3);
    tiles[oy][ox] = TileType.Wall;
  }

  return { width: w, height: h, tiles };
}

/** Get all floor tile positions in a room */
export function getFloorPositions(layout: RoomLayout): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  for (let y = 0; y < layout.height; y++) {
    for (let x = 0; x < layout.width; x++) {
      if (layout.tiles[y][x] === TileType.Floor) {
        positions.push({ x, y });
      }
    }
  }
  return positions;
}
