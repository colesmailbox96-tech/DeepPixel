import Phaser from 'phaser';
import { Difficulty, type EnemyDef, type LootTable } from '@echo-party/shared';
import {
  initGameState,
  processTick,
  advanceRoom,
  summarizeRun,
  type GameState,
  type GameEvent,
} from '@echo-party/sim';
import { ENEMY_DEFS, DEFAULT_LOOT_TABLE } from '@echo-party/content';
import { InputHandler } from '../systems/input-handler';
import { RenderSync } from '../systems/render-sync';

interface RunSceneData {
  contractId: string;
  seed: string;
  difficulty: string;
  roomCount: number;
}

/**
 * RunScene — the active dungeon run.
 * All game logic lives in packages/sim. This scene is an adapter only:
 * reads input, forwards to sim, renders results.
 */
export class RunScene extends Phaser.Scene {
  private gameState!: GameState;
  private inputHandler!: InputHandler;
  private renderSync!: RenderSync;
  private enemyDefs!: EnemyDef[];
  private lootTable!: LootTable;
  private tickTimer = 0;
  private readonly TICK_INTERVAL_MS = 200;
  private startTime = 0;
  private statusText!: Phaser.GameObjects.Text;
  private roomAdvanceTimer = 0;
  private isAdvancing = false;

  constructor() {
    super({ key: 'RunScene' });
  }

  init(data: RunSceneData): void {
    const difficulty = (data.difficulty as Difficulty) ?? Difficulty.Normal;
    const seed = data.seed ?? `run-${Date.now()}`;
    const contractId = data.contractId ?? 'contract-sewer-sweep';
    const roomCount = data.roomCount ?? 3;

    this.enemyDefs = Object.values(ENEMY_DEFS);
    this.lootTable = DEFAULT_LOOT_TABLE;

    this.gameState = initGameState(
      { seed, difficulty, contractId },
      this.enemyDefs,
      roomCount,
    );

    this.startTime = Date.now();
    this.tickTimer = 0;
    this.roomAdvanceTimer = 0;
    this.isAdvancing = false;
  }

  create(): void {
    this.inputHandler = new InputHandler(this);
    this.renderSync = new RenderSync(this);
    this.renderSync.buildRoom(this.gameState);

    const { width } = this.cameras.main;
    this.statusText = this.add
      .text(width / 2, 16, '', {
        fontSize: '14px',
        color: '#cccccc',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(30);

    this.updateStatusText();

    // Launch UIScene as overlay
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene', { gameState: this.gameState });
    } else {
      this.scene.get('UIScene').events.emit('update-state', this.gameState);
    }
  }

  update(_time: number, delta: number): void {
    if (this.gameState.run.completed) return;

    // Handle room advance delay
    if (this.isAdvancing) {
      this.roomAdvanceTimer -= delta;
      if (this.roomAdvanceTimer <= 0) {
        this.isAdvancing = false;
        advanceRoom(this.gameState, this.enemyDefs);
        this.renderSync.buildRoom(this.gameState);
        this.updateStatusText();
      }
      return;
    }

    // Throttled tick processing
    this.tickTimer += delta;
    if (this.tickTimer < this.TICK_INTERVAL_MS) return;
    this.tickTimer = 0;

    const action = this.inputHandler.poll();
    const events = processTick(this.gameState, action, this.enemyDefs, this.lootTable);

    // Sync rendering
    this.renderSync.syncPlayer(this.gameState);
    this.renderSync.syncEnemies(this.gameState.enemies);
    this.renderSync.syncLoot(this.gameState);
    this.renderSync.showDamage(events);
    this.updateStatusText();

    // Emit state to UIScene
    this.scene.get('UIScene')?.events.emit('update-state', this.gameState);

    // Handle events
    this.handleEvents(events);
  }

  private handleEvents(events: GameEvent[]): void {
    for (const evt of events) {
      if (evt.type === 'room_cleared' && !this.gameState.run.completed) {
        this.showCenterMessage('Room Cleared!', '#44ff44');
        this.isAdvancing = true;
        this.roomAdvanceTimer = 1500;
      } else if (evt.type === 'run_victory') {
        this.showEndScreen(true);
      } else if (evt.type === 'player_died') {
        this.showEndScreen(false);
      }
    }
  }

  private showCenterMessage(msg: string, color: string): void {
    const { width, height } = this.cameras.main;
    const text = this.add
      .text(width / 2, height / 2, msg, {
        fontSize: '28px',
        color,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(50);

    this.tweens.add({
      targets: text,
      alpha: 0,
      y: height / 2 - 40,
      duration: 1200,
      onComplete: () => text.destroy(),
    });
  }

  private showEndScreen(victory: boolean): void {
    const { width, height } = this.cameras.main;
    const durationMs = Date.now() - this.startTime;
    const summary = summarizeRun(this.gameState.run, durationMs);

    // Overlay background
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setDepth(40);

    const titleColor = victory ? '#44ff44' : '#ff4444';
    const titleText = victory ? 'VICTORY!' : 'DEFEATED';

    this.add
      .text(width / 2, height / 2 - 80, titleText, {
        fontSize: '36px',
        color: titleColor,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(50);

    const statsLines = [
      `Rooms Cleared: ${summary.roomsCleared}`,
      `Enemies Defeated: ${summary.enemiesDefeated}`,
      `Damage Dealt: ${summary.damageDealt}`,
      `Damage Taken: ${summary.damageTaken}`,
      `Items Collected: ${summary.itemsCollected}`,
      `Duration: ${(summary.durationMs / 1000).toFixed(1)}s`,
    ];

    this.add
      .text(width / 2, height / 2, statsLines.join('\n'), {
        fontSize: '16px',
        color: '#cccccc',
        fontFamily: 'monospace',
        align: 'center',
        lineSpacing: 6,
      })
      .setOrigin(0.5)
      .setDepth(50);

    const backText = this.add
      .text(width / 2, height / 2 + 100, '[ Return to Hub ]', {
        fontSize: '20px',
        color: '#44aaff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(50);

    backText.on('pointerover', () => backText.setColor('#88ccff'));
    backText.on('pointerout', () => backText.setColor('#44aaff'));
    backText.on('pointerdown', () => {
      this.scene.stop('UIScene');
      this.scene.start('HubScene');
    });
  }

  private updateStatusText(): void {
    const gs = this.gameState;
    const aliveEnemies = gs.enemies.filter((e) => e.alive).length;
    this.statusText.setText(
      `Room ${gs.run.currentRoom + 1}/${gs.totalRooms} | Enemies: ${aliveEnemies} | HP: ${gs.run.player.currentHp}/${gs.run.player.maxHp}`,
    );
  }
}
