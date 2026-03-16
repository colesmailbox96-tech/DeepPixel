import { describe, it, expect } from 'vitest';
import { SeededRng } from '../rng';
import { generateRoom, getFloorPositions, TileType } from './room-gen';
import { Biome } from '@echo-party/shared';

describe('generateRoom', () => {
  it('generates a room with correct dimensions', () => {
    const rng = new SeededRng('room-test');
    const room = generateRoom(rng, 10, 8);

    expect(room.width).toBe(10);
    expect(room.height).toBe(8);
    expect(room.tiles.length).toBe(8);
    expect(room.tiles[0].length).toBe(10);
  });

  it('has walls on the perimeter', () => {
    const rng = new SeededRng('wall-test');
    const room = generateRoom(rng, 10, 8);

    // Top and bottom rows
    for (let x = 0; x < room.width; x++) {
      expect(room.tiles[0][x]).toBe(TileType.Wall);
      expect(room.tiles[room.height - 1][x]).toBe(TileType.Wall);
    }
    // Left and right columns
    for (let y = 0; y < room.height; y++) {
      expect(room.tiles[y][0]).toBe(TileType.Wall);
      expect(room.tiles[y][room.width - 1]).toBe(TileType.Wall);
    }
  });

  it('has floor tiles in the interior', () => {
    const rng = new SeededRng('floor-test');
    const room = generateRoom(rng, 10, 8);

    // At least some interior tiles should be floor
    let floorCount = 0;
    for (let y = 1; y < room.height - 1; y++) {
      for (let x = 1; x < room.width - 1; x++) {
        if (room.tiles[y][x] === TileType.Floor) floorCount++;
      }
    }
    expect(floorCount).toBeGreaterThan(0);
  });

  it('is deterministic for the same seed', () => {
    const rng1 = new SeededRng('det-room');
    const rng2 = new SeededRng('det-room');

    const room1 = generateRoom(rng1, 15, 11);
    const room2 = generateRoom(rng2, 15, 11);

    expect(room1.tiles).toEqual(room2.tiles);
  });

  it('uses default dimensions when not specified', () => {
    const rng = new SeededRng('default-dims');
    const room = generateRoom(rng);

    expect(room.width).toBe(15);
    expect(room.height).toBe(11);
  });
});

describe('getFloorPositions', () => {
  it('returns only floor positions', () => {
    const rng = new SeededRng('floor-pos');
    const room = generateRoom(rng, 10, 8);
    const floors = getFloorPositions(room);

    for (const pos of floors) {
      expect(room.tiles[pos.y][pos.x]).toBe(TileType.Floor);
    }
    expect(floors.length).toBeGreaterThan(0);
  });
});

// ─── Phase 5: Biome-aware room generation ─────────────────────────────────────

describe('generateRoom with biome rules', () => {
  it('uses biome room dimensions when provided', () => {
    const rng = new SeededRng('biome-dims');
    const biome = {
      biome: Biome.Forest,
      name: 'Forest',
      minObstacles: 3,
      maxObstacles: 6,
      roomWidth: 17,
      roomHeight: 13,
      preferredEnemies: ['archer' as const],
    };
    const room = generateRoom(rng, undefined, undefined, biome);
    expect(room.width).toBe(17);
    expect(room.height).toBe(13);
  });

  it('uses biome obstacle range', () => {
    // High obstacle biome should produce more obstacles
    const biome = {
      biome: Biome.Crypt,
      name: 'Crypt',
      minObstacles: 4,
      maxObstacles: 6,
      preferredEnemies: ['skeleton' as const],
    };
    const rng = new SeededRng('biome-obstacles');
    const room = generateRoom(rng, undefined, undefined, biome);

    const wallInteriorCount = room.tiles
      .slice(1, room.height - 1)
      .flatMap((row) => row.slice(1, room.width - 1))
      .filter((t) => t === TileType.Wall).length;

    expect(wallInteriorCount).toBeGreaterThanOrEqual(4);
    expect(wallInteriorCount).toBeLessThanOrEqual(6);
  });

  it('biome dimensions override explicit width/height', () => {
    const rng = new SeededRng('biome-override');
    const biome = {
      biome: Biome.Volcano,
      name: 'Volcano',
      minObstacles: 2,
      maxObstacles: 4,
      roomWidth: 13,
      roomHeight: 11,
      preferredEnemies: ['drake' as const],
    };
    const room = generateRoom(rng, 20, 20, biome);
    expect(room.width).toBe(13);
    expect(room.height).toBe(11);
  });

  it('falls back to explicit/default dimensions when biome has no room size', () => {
    const rng = new SeededRng('biome-fallback');
    const biome = {
      biome: Biome.Sewer,
      name: 'Sewer',
      minObstacles: 1,
      maxObstacles: 3,
      preferredEnemies: ['slime' as const],
    };
    const room = generateRoom(rng, undefined, undefined, biome);
    expect(room.width).toBe(15); // DEFAULT_ROOM_WIDTH
    expect(room.height).toBe(11); // DEFAULT_ROOM_HEIGHT
  });
});
