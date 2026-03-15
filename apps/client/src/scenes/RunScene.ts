import Phaser from 'phaser';
import { Difficulty } from '@echo-party/shared';
import { createRunState } from '@echo-party/sim';

/**
 * RunScene — the active dungeon run.
 *
 * Phase 1: minimal placeholder confirming the sim layer is connected.
 * All real game logic will live in packages/sim, not in this scene.
 */
export class RunScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RunScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Create a run state via the sim layer
    const runState = createRunState({
      seed: `run-${Date.now()}`,
      difficulty: Difficulty.Normal,
      contractId: 'contract-001',
    });

    this.add
      .text(width / 2, height / 2 - 40, 'RUN ACTIVE', {
        fontSize: '24px',
        color: '#ff8844',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height / 2 + 10,
        `HP: ${runState.player.currentHp}/${runState.player.maxHp}`,
        {
          fontSize: '16px',
          color: '#88ff88',
          fontFamily: 'monospace',
        },
      )
      .setOrigin(0.5);

    const backText = this.add
      .text(width / 2, height / 2 + 60, '[ Return to Hub ]', {
        fontSize: '18px',
        color: '#44aaff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backText.on('pointerover', () => backText.setColor('#88ccff'));
    backText.on('pointerout', () => backText.setColor('#44aaff'));
    backText.on('pointerdown', () => {
      this.scene.start('HubScene');
    });
  }
}
