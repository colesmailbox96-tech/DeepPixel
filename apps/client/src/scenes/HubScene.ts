import Phaser from 'phaser';

/**
 * HubScene — the home base between runs.
 * Players select contracts, manage loadouts, and view Echoes here.
 *
 * Phase 1: minimal placeholder showing scene transition works.
 */
export class HubScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HubScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.add
      .text(width / 2, height / 2 - 40, 'Project Echo Party', {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 10, 'HUB — Phase 1 Scaffold', {
        fontSize: '18px',
        color: '#aaaacc',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    const startText = this.add
      .text(width / 2, height / 2 + 60, '[ Start Run ]', {
        fontSize: '20px',
        color: '#44aaff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startText.on('pointerover', () => startText.setColor('#88ccff'));
    startText.on('pointerout', () => startText.setColor('#44aaff'));
    startText.on('pointerdown', () => {
      this.scene.start('RunScene');
    });
  }
}
