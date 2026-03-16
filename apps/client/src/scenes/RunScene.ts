import Phaser from 'phaser';
import {
  Biome,
  Difficulty,
  defaultMetaProgression,
  type EchoProfileV1,
  type EnemyDef,
  type LootTable,
  type MetaProgression,
  type SaveSlotData,
  type VfxEffectDef,
} from '@echo-party/shared';
import {
  initGameState,
  processTick,
  advanceRoom,
  summarizeRun,
  type GameState,
  type GameEvent,
  SaveAdapter,
  serializeRunState,
  createEmptySlot,
  recordRun,
  createActionLog,
  recordAction,
  distillEcho,
  type ActionLog,
} from '@echo-party/sim';
import {
  CONTRACTS,
  ENEMY_DEFS,
  BIOME_RULES,
  DEFAULT_LOOT_TABLE,
  ICE_CAVE_LOOT_TABLE,
  RUINS_LOOT_TABLE,
  VFX_EFFECTS,
} from '@echo-party/content';
import type { BiomeRules } from '@echo-party/content';
import { InputHandler } from '../systems/input-handler';
import { RenderSync } from '../systems/render-sync';
import { VfxManager } from '../systems/vfx-manager';

// ── VFX helpers ───────────────────────────────────────────────────────────────

/** Biome → ambient effect id mapping. */
const BIOME_AMBIENT_EFFECT: Partial<Record<Biome, string>> = {
  [Biome.Sewer]: 'ambient_sewer',
  [Biome.Crypt]: 'ambient_crypt',
  [Biome.Volcano]: 'ambient_volcano',
  [Biome.IceCave]: 'ambient_ice_cave',
  [Biome.Forest]: 'ambient_forest',
  [Biome.Ruins]: 'ambient_ruins',
};

/** Map a drop kind to the VFX glow effect id appropriate for its tier. */
function lootEffectId(dropKind: string): string {
  // Coins get an uncommon glow; potions get a rare blue glow.
  // Relic drops and future high-rarity items will map to epic/legendary.
  switch (dropKind) {
    case 'coin':
      return 'loot_uncommon';
    case 'health_potion':
      return 'loot_rare';
    default:
      return 'loot_common';
  }
}

/** Map a GameEvent to the VfxEffectDefs to fire. */
function effectsForEvent(evt: GameEvent): VfxEffectDef[] {
  switch (evt.type) {
    case 'player_attacked':
      return [VFX_EFFECTS['player_hit']].filter(Boolean);
    case 'enemy_attacked':
      return [VFX_EFFECTS['enemy_hit']].filter(Boolean);
    case 'echo_attacked':
    case 'echo_took_damage':
      return [VFX_EFFECTS['echo_hit']].filter(Boolean);
    case 'room_cleared':
      return [VFX_EFFECTS['room_clear']].filter(Boolean);
    default:
      return [];
  }
}

interface RunSceneData {
  contractId: string;
  seed: string;
  difficulty: string;
  roomCount: number;
  saveAdapter?: SaveAdapter;
  meta?: MetaProgression;
  echoProfile?: EchoProfileV1;
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
  private vfxManager!: VfxManager;
  private enemyDefs!: EnemyDef[];
  private lootTable!: LootTable;
  private tickTimer = 0;
  private readonly TICK_INTERVAL_MS = 200;
  private startTime = 0;
  private statusText!: Phaser.GameObjects.Text;
  private roomAdvanceTimer = 0;
  private isAdvancing = false;

  /** Active biome (resolved from contract) — drives ambient VFX. */
  private currentBiome: Biome | null = null;

  /** Save system state — optional so the scene works without it */
  private saveAdapter: SaveAdapter | null = null;
  private meta: MetaProgression = defaultMetaProgression();
  private saveSlot: SaveSlotData | null = null;
  private saveTimer = 0;
  private readonly SAVE_INTERVAL_MS = 5000;

  /** Echo system state */
  private actionLog: ActionLog = createActionLog();
  private echoProfile: EchoProfileV1 | null = null;

  constructor() {
    super({ key: 'RunScene' });
  }

  init(data: RunSceneData): void {
    const difficulty = (data.difficulty as Difficulty) ?? Difficulty.Normal;
    const seed = data.seed ?? `run-${Date.now()}`;
    const contractId = data.contractId ?? 'contract-sewer-sweep';
    const roomCount = data.roomCount ?? 3;

    this.enemyDefs = Object.values(ENEMY_DEFS);

    // Resolve biome rules and loot table from the contract definition
    const contract = CONTRACTS.find((c) => c.id === contractId);
    const biomeRules: BiomeRules | undefined =
      contract?.biome !== undefined ? BIOME_RULES[contract.biome] : undefined;

    // Track biome for ambient VFX selection
    this.currentBiome = contract?.biome ?? null;

    // Select biome-appropriate loot table
    if (contract?.biome === Biome.IceCave) {
      this.lootTable = ICE_CAVE_LOOT_TABLE;
    } else if (contract?.biome === Biome.Ruins) {
      this.lootTable = RUINS_LOOT_TABLE;
    } else {
      this.lootTable = DEFAULT_LOOT_TABLE;
    }

    this.gameState = initGameState(
      { seed, difficulty, contractId },
      this.enemyDefs,
      roomCount,
      data.echoProfile,
      biomeRules,
    );

    this.startTime = Date.now();
    this.tickTimer = 0;
    this.roomAdvanceTimer = 0;
    this.isAdvancing = false;

    // Save system
    this.saveAdapter = data.saveAdapter ?? null;
    this.meta = data.meta ?? defaultMetaProgression();
    this.saveTimer = 0;

    // Echo system — track actions for post-run distillation
    this.actionLog = createActionLog();
    this.echoProfile = data.echoProfile ?? null;

    // Create the save slot once — subsequent saves only update runState/updatedAt
    if (this.saveAdapter) {
      const slotId = `slot-${seed}`;
      this.saveSlot = createEmptySlot(slotId, `Run ${this.gameState.run.config.contractId}`);
    }
  }

  create(): void {
    this.inputHandler = new InputHandler(this);
    this.renderSync = new RenderSync(this);
    this.vfxManager = new VfxManager(this);
    this.renderSync.buildRoom(this.gameState);
    this.startAmbientVfx();
    this.syncEntityShadows();

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

    // Initial save
    this.persistRunState();
  }

  update(_time: number, delta: number): void {
    if (this.gameState.run.completed) return;

    // Always tick ambient particles
    this.vfxManager.updateAmbient(delta);

    // Handle room advance delay
    if (this.isAdvancing) {
      this.roomAdvanceTimer -= delta;
      if (this.roomAdvanceTimer <= 0) {
        this.isAdvancing = false;
        advanceRoom(this.gameState, this.enemyDefs);
        this.vfxManager.clearAll();
        this.renderSync.buildRoom(this.gameState);
        this.startAmbientVfx();
        this.syncEntityShadows();
        this.updateStatusText();
      }
      return;
    }

    // Throttled tick processing
    this.tickTimer += delta;
    if (this.tickTimer < this.TICK_INTERVAL_MS) return;
    this.tickTimer = 0;

    const action = this.inputHandler.poll();
    const events = processTick(this.gameState, action, this.lootTable);

    // Record action for Echo distillation
    const killedEvt = events.find((e) => e.type === 'player_attacked' && 'killed' in e && e.killed);
    const killedArchetype =
      killedEvt && killedEvt.type === 'player_attacked'
        ? (this.gameState.enemies.find((e) => e.id === killedEvt.targetId)?.archetype ?? null)
        : null;
    const aliveEnemiesForLog = this.gameState.enemies.filter((e) => e.alive);
    recordAction(
      this.actionLog,
      action,
      this.gameState.playerPos,
      aliveEnemiesForLog.map((e) => e.position),
      aliveEnemiesForLog.map((e) => e.archetype),
      killedArchetype,
    );

    // Sync rendering
    this.renderSync.syncPlayer(this.gameState);
    this.renderSync.syncEnemies(this.gameState.enemies);
    this.renderSync.syncLoot(this.gameState);
    this.renderSync.showDamage(events);
    this.updateStatusText();

    // Phase 10 — sync shadows and VFX
    this.syncEntityShadows();
    this.syncLootGlows();
    this.vfxManager.processEvents(events, this.renderSync.entityScreenPositions, effectsForEvent);

    // Emit state to UIScene
    this.scene.get('UIScene')?.events.emit('update-state', this.gameState);

    // Periodic save — use real elapsed time (delta) to avoid drift under lag
    this.saveTimer += delta;
    if (this.saveTimer >= this.SAVE_INTERVAL_MS) {
      this.saveTimer = 0;
      this.persistRunState();
    }

    // Handle events
    this.handleEvents(events);
  }

  private handleEvents(events: GameEvent[]): void {
    for (const evt of events) {
      if (evt.type === 'room_cleared' && !this.gameState.run.completed) {
        this.showCenterMessage('Room Cleared!', '#44ff44');
        this.isAdvancing = true;
        this.roomAdvanceTimer = 1500;
        // Save on room clear
        this.persistRunState();
      } else if (evt.type === 'run_victory') {
        this.persistEndOfRun(true);
        this.showEndScreen(true);
      } else if (evt.type === 'player_died') {
        this.persistEndOfRun(false);
        this.showEndScreen(false);
      }
    }
  }

  /** Persist the current run state to a save slot */
  private persistRunState(): void {
    if (!this.saveAdapter || !this.saveSlot) return;
    // Update only the mutable fields — preserves createdAt from slot creation
    this.saveSlot.runState = serializeRunState(this.gameState.run);
    this.saveSlot.updatedAt = new Date().toISOString();
    this.saveAdapter.saveSlot(this.saveSlot).catch((err) => {
      console.warn('Save failed:', err);
    });
  }

  /** Persist final run state and update meta-progression */
  private persistEndOfRun(_victory: boolean): void {
    if (!this.saveAdapter) return;
    const durationMs = Date.now() - this.startTime;
    const summary = summarizeRun(this.gameState.run, durationMs);
    this.meta = recordRun(this.meta, summary);

    // Distill Echo from this run's action log
    const echoId = `echo-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const echoName = `Echo #${this.meta.totalRuns}`;
    const newEcho = distillEcho(this.actionLog, this.gameState.run.config.seed, echoId, echoName);

    // Save meta + final slot state + Echo
    this.saveAdapter.saveMeta(this.meta).catch((err) => {
      console.warn('Meta save failed:', err);
    });
    this.saveAdapter.saveEchoLibraryEntry(newEcho).catch((err) => {
      console.warn('Echo save failed:', err);
    });
    this.persistRunState();
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

    // Only show Echo creation notice if persistence is enabled
    if (this.saveAdapter) {
      statsLines.push('', '✦ Echo Created ✦');
    }

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
    const echoStatus = gs.echo ? (gs.echo.alive ? ' | Echo: Active' : ' | Echo: Down') : '';
    this.statusText.setText(
      `Room ${gs.run.currentRoom + 1}/${gs.run.totalRooms} | Enemies: ${aliveEnemies} | HP: ${gs.run.player.currentHp}/${gs.run.player.maxHp}${echoStatus}`,
    );
  }

  // ── Phase 10 VFX helpers ─────────────────────────────────────────────────

  /** Start the biome-appropriate ambient VFX emitter. */
  private startAmbientVfx(): void {
    if (!this.currentBiome) return;
    const effectId = BIOME_AMBIENT_EFFECT[this.currentBiome];
    if (!effectId) return;
    const def = VFX_EFFECTS[effectId];
    if (!def?.ambient) return;
    this.vfxManager.startAmbient(
      def.ambient,
      this.gameState.room.width,
      this.gameState.room.height,
      this.renderSync.roomOffsetX,
      this.renderSync.roomOffsetY,
    );
  }

  /** Sync ground shadow ellipses for the player, echo, and all living enemies. */
  private syncEntityShadows(): void {
    const positions = this.renderSync.entityScreenPositions;
    for (const [id, pos] of positions) {
      this.vfxManager.syncEntityShadow(id, pos.x, pos.y);
    }
  }

  /** Sync loot glow rings with the current loot state. */
  private syncLootGlows(): void {
    const lootKeys = new Set(this.renderSync.lootScreenPositions.keys());
    const keyToDef = new Map<string, VfxEffectDef>();
    for (const l of this.gameState.lootOnGround) {
      const key = `${l.position.x},${l.position.y},${l.drop.kind}`;
      const effectId = lootEffectId(l.drop.kind);
      const def = VFX_EFFECTS[effectId];
      if (def) keyToDef.set(key, def);
    }
    this.vfxManager.syncLootGlows(lootKeys, keyToDef, this.renderSync.lootScreenPositions);
  }
}
