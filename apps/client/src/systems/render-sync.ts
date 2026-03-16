import Phaser from 'phaser';
import { TILE_SIZE, SCALE_FACTOR } from '@echo-party/shared';
import type { GameState, GameEvent } from '@echo-party/sim';
import { TileType } from '@echo-party/sim';
import type { EnemyEntity } from '@echo-party/sim';

const SCALED_TILE = TILE_SIZE * SCALE_FACTOR;

/** Offset to center the room in the viewport */
function getRoomOffset(
  viewWidth: number,
  viewHeight: number,
  roomWidth: number,
  roomHeight: number,
): { ox: number; oy: number } {
  return {
    ox: Math.floor((viewWidth - roomWidth * SCALED_TILE) / 2),
    oy: Math.floor((viewHeight - roomHeight * SCALED_TILE) / 2),
  };
}

/**
 * RenderSync — keeps Phaser display objects in sync with the sim GameState.
 * All game logic is in the sim layer; this only handles visuals.
 */
export class RenderSync {
  private scene: Phaser.Scene;
  private tileSprites: Phaser.GameObjects.Rectangle[] = [];
  private playerSprite!: Phaser.GameObjects.Rectangle;
  private enemySprites: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private lootSprites: Phaser.GameObjects.Rectangle[] = [];
  private damageTexts: Phaser.GameObjects.Text[] = [];
  private echoSprite: Phaser.GameObjects.Rectangle | null = null;
  private ox = 0;
  private oy = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Build the initial room display from game state */
  buildRoom(state: GameState): void {
    this.clearAll();

    const { width, height } = this.scene.cameras.main;
    const { ox, oy } = getRoomOffset(width, height, state.room.width, state.room.height);
    this.ox = ox;
    this.oy = oy;

    // Draw tiles
    for (let y = 0; y < state.room.height; y++) {
      for (let x = 0; x < state.room.width; x++) {
        const tile = state.room.tiles[y][x];
        const color = tile === TileType.Wall ? 0x333355 : 0x1a1a2e;
        const rect = this.scene.add.rectangle(
          ox + x * SCALED_TILE + SCALED_TILE / 2,
          oy + y * SCALED_TILE + SCALED_TILE / 2,
          SCALED_TILE - 1,
          SCALED_TILE - 1,
          color,
        );
        this.tileSprites.push(rect);
      }
    }

    // Draw player
    this.playerSprite = this.scene.add.rectangle(
      ox + state.playerPos.x * SCALED_TILE + SCALED_TILE / 2,
      oy + state.playerPos.y * SCALED_TILE + SCALED_TILE / 2,
      SCALED_TILE - 4,
      SCALED_TILE - 4,
      0x4488ff,
    );
    this.playerSprite.setDepth(10);

    // Draw enemies
    this.syncEnemies(state.enemies);

    // Draw Echo companion
    this.syncEcho(state);
  }

  /** Sync player position */
  syncPlayer(state: GameState): void {
    if (!this.playerSprite) return;
    this.playerSprite.setPosition(
      this.ox + state.playerPos.x * SCALED_TILE + SCALED_TILE / 2,
      this.oy + state.playerPos.y * SCALED_TILE + SCALED_TILE / 2,
    );
    this.syncEcho(state);
  }

  /** Sync Echo companion sprite */
  syncEcho(state: GameState): void {
    if (!state.echo) {
      if (this.echoSprite) {
        this.echoSprite.destroy();
        this.echoSprite = null;
      }
      return;
    }

    if (!state.echo.alive) {
      if (this.echoSprite) {
        this.echoSprite.destroy();
        this.echoSprite = null;
      }
      return;
    }

    if (!this.echoSprite) {
      this.echoSprite = this.scene.add.rectangle(
        this.ox + state.echo.position.x * SCALED_TILE + SCALED_TILE / 2,
        this.oy + state.echo.position.y * SCALED_TILE + SCALED_TILE / 2,
        SCALED_TILE - 6,
        SCALED_TILE - 6,
        0xccaa44,
      );
      this.echoSprite.setDepth(10);
      this.echoSprite.setAlpha(0.7);
    } else {
      this.echoSprite.setPosition(
        this.ox + state.echo.position.x * SCALED_TILE + SCALED_TILE / 2,
        this.oy + state.echo.position.y * SCALED_TILE + SCALED_TILE / 2,
      );
    }
  }

  /** Sync enemy sprites to current state */
  syncEnemies(enemies: EnemyEntity[]): void {
    for (const enemy of enemies) {
      let sprite = this.enemySprites.get(enemy.id);
      if (!enemy.alive) {
        if (sprite) {
          sprite.destroy();
          this.enemySprites.delete(enemy.id);
        }
        continue;
      }

      if (!sprite) {
        // Lookup color from archetype
        const colorMap: Record<string, number> = {
          slime: 0x44cc44,
          goblin: 0xcc4444,
          archer: 0xcccc44,
        };
        sprite = this.scene.add.rectangle(
          this.ox + enemy.position.x * SCALED_TILE + SCALED_TILE / 2,
          this.oy + enemy.position.y * SCALED_TILE + SCALED_TILE / 2,
          SCALED_TILE - 4,
          SCALED_TILE - 4,
          colorMap[enemy.archetype] ?? 0xff00ff,
        );
        sprite.setDepth(9);
        this.enemySprites.set(enemy.id, sprite);
      } else {
        sprite.setPosition(
          this.ox + enemy.position.x * SCALED_TILE + SCALED_TILE / 2,
          this.oy + enemy.position.y * SCALED_TILE + SCALED_TILE / 2,
        );
      }
    }
  }

  /** Sync loot on ground — reuses sprites when position and kind match */
  syncLoot(state: GameState): void {
    const loot = state.lootOnGround;

    // Build a set of current loot keys for quick lookup
    const currentKeys = new Set<string>();
    for (const l of loot) {
      currentKeys.add(`${l.position.x},${l.position.y},${l.drop.kind}`);
    }

    // Remove sprites that no longer exist in state
    const kept: Phaser.GameObjects.Rectangle[] = [];
    for (const s of this.lootSprites) {
      const key = s.getData('lootKey') as string;
      if (currentKeys.has(key)) {
        kept.push(s);
      } else {
        s.destroy();
      }
    }
    this.lootSprites = kept;

    // Build a set of existing sprite keys
    const existingKeys = new Set<string>();
    for (const s of this.lootSprites) {
      existingKeys.add(s.getData('lootKey') as string);
    }

    // Add new sprites for loot not yet rendered
    for (const l of loot) {
      const key = `${l.position.x},${l.position.y},${l.drop.kind}`;
      if (!existingKeys.has(key)) {
        const color = l.drop.kind === 'health_potion' ? 0xff4488 : 0xffcc00;
        const sprite = this.scene.add.rectangle(
          this.ox + l.position.x * SCALED_TILE + SCALED_TILE / 2,
          this.oy + l.position.y * SCALED_TILE + SCALED_TILE / 2,
          SCALED_TILE / 2,
          SCALED_TILE / 2,
          color,
        );
        sprite.setDepth(8);
        sprite.setData('lootKey', key);
        this.lootSprites.push(sprite);
      }
    }
  }

  /** Show floating damage number */
  showDamage(events: GameEvent[]): void {
    for (const evt of events) {
      if (evt.type === 'player_attacked' || evt.type === 'echo_attacked') {
        const targetId = evt.targetId;
        const enemy = this.enemySprites.get(targetId);
        if (enemy) {
          const color = evt.type === 'echo_attacked' ? '#ccaa44' : '#ff4444';
          this.floatText(enemy.x, enemy.y - 10, `-${evt.damage}`, color);
        }
      } else if (evt.type === 'enemy_attacked') {
        if (this.playerSprite) {
          this.floatText(
            this.playerSprite.x,
            this.playerSprite.y - 10,
            `-${evt.damage}`,
            '#ff8844',
          );
        }
      } else if (evt.type === 'echo_took_damage' && this.echoSprite) {
        this.floatText(this.echoSprite.x, this.echoSprite.y - 10, `-${evt.damage}`, '#cc6644');
      }
    }
  }

  private floatText(x: number, y: number, text: string, color: string): void {
    const t = this.scene.add
      .text(x, y, text, {
        fontSize: '14px',
        color,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.scene.tweens.add({
      targets: t,
      y: y - 30,
      alpha: 0,
      duration: 600,
      onComplete: () => t.destroy(),
    });

    this.damageTexts.push(t);
  }

  /** Clear all display objects */
  clearAll(): void {
    for (const s of this.tileSprites) s.destroy();
    this.tileSprites = [];

    if (this.playerSprite) {
      this.playerSprite.destroy();
    }

    for (const [, s] of this.enemySprites) s.destroy();
    this.enemySprites.clear();

    for (const s of this.lootSprites) s.destroy();
    this.lootSprites = [];

    if (this.echoSprite) {
      this.echoSprite.destroy();
      this.echoSprite = null;
    }

    for (const t of this.damageTexts) {
      if (t.active) t.destroy();
    }
    this.damageTexts = [];
  }
}
