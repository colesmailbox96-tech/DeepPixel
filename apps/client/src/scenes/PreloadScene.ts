import Phaser from 'phaser';

/**
 * PreloadScene — loads all game assets.
 * In Phase 1 this is mostly a placeholder; assets are added in later phases.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    const { width, height } = this.cameras.main;
    const barX = width / 2 - 150;
    const barY = height / 2;

    // Simple loading bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222244, 0.8);
    progressBox.fillRect(barX, barY, 300, 30);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x44aaff, 1);
      progressBar.fillRect(barX + 5, barY + 5, 290 * value, 20);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
    });

    // Phase 1: no real assets to load yet
    // Future phases will add sprite sheets, tilemaps, audio, etc.
  }

  create(): void {
    this.scene.start('HubScene');
  }
}
