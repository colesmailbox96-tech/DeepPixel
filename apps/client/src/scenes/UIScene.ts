import Phaser from 'phaser';
import type { GameState } from '@echo-party/sim';

/**
 * UIScene — persistent HUD overlay that runs alongside RunScene.
 * Displays health bar, enemy count, loot notifications, and Echo companion status.
 */
export class UIScene extends Phaser.Scene {
  private hpBarBg!: Phaser.GameObjects.Rectangle;
  private hpBarFill!: Phaser.GameObjects.Rectangle;
  private hpText!: Phaser.GameObjects.Text;
  private enemyText!: Phaser.GameObjects.Text;
  private roomText!: Phaser.GameObjects.Text;
  private controlsText!: Phaser.GameObjects.Text;
  private echoText!: Phaser.GameObjects.Text;
  private onUpdateState!: (state: GameState) => void;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    const { width } = this.cameras.main;

    // Health bar
    this.hpBarBg = this.add.rectangle(120, 30, 200, 20, 0x333355).setDepth(100);
    this.hpBarFill = this.add.rectangle(120, 30, 200, 20, 0x44cc44).setDepth(101);

    this.hpText = this.add
      .text(120, 30, '', {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(102);

    // Enemy count
    this.enemyText = this.add
      .text(width - 120, 20, '', {
        fontSize: '14px',
        color: '#ff8844',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(100);

    // Room indicator
    this.roomText = this.add
      .text(width - 120, 42, '', {
        fontSize: '12px',
        color: '#aaaacc',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(100);

    // Echo companion status
    this.echoText = this.add
      .text(120, 56, '', {
        fontSize: '11px',
        color: '#ccaa44',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(100);

    // Controls hint
    this.controlsText = this.add
      .text(width / 2, this.cameras.main.height - 20, 'WASD/Arrows: Move | Space: Attack', {
        fontSize: '11px',
        color: '#555566',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(100);

    // Listen for state updates from RunScene
    this.onUpdateState = (state: GameState) => {
      this.updateHUD(state);
    };
    this.events.on('update-state', this.onUpdateState);

    // Clean up listener on shutdown to prevent accumulation across runs
    this.events.once('shutdown', () => {
      this.events.off('update-state', this.onUpdateState);
    });
  }

  private updateHUD(state: GameState): void {
    const { currentHp, maxHp } = state.run.player;
    const hpRatio = maxHp > 0 ? currentHp / maxHp : 0;

    // Update health bar
    this.hpBarFill.setScale(hpRatio, 1);
    this.hpBarFill.setPosition(120 - (1 - hpRatio) * 100, 30);

    // Color based on HP
    if (hpRatio > 0.5) {
      this.hpBarFill.setFillStyle(0x44cc44);
    } else if (hpRatio > 0.25) {
      this.hpBarFill.setFillStyle(0xcccc44);
    } else {
      this.hpBarFill.setFillStyle(0xcc4444);
    }

    this.hpText.setText(`HP: ${currentHp}/${maxHp}`);

    // Update enemy count
    const aliveEnemies = state.enemies.filter((e) => e.alive).length;
    this.enemyText.setText(`Enemies: ${aliveEnemies}`);

    // Update room indicator
    this.roomText.setText(`Room ${state.run.currentRoom + 1}/${state.run.totalRooms}`);

    // Update Echo companion status
    if (state.echo) {
      if (state.echo.alive) {
        const echoHp = state.echo.stats.currentHp;
        const echoMaxHp = state.echo.stats.maxHp;
        this.echoText.setText(`✦ Echo HP: ${echoHp}/${echoMaxHp}`);
        this.echoText.setColor(echoHp / echoMaxHp > 0.5 ? '#ccaa44' : '#cc6644');
      } else {
        this.echoText.setText('✦ Echo: Down');
        this.echoText.setColor('#664444');
      }
    } else {
      this.echoText.setText('');
    }
  }
}
