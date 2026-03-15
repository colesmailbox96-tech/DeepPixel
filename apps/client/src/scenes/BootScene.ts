import Phaser from 'phaser';

/**
 * BootScene — first scene to run.
 * Handles minimal setup before asset loading begins.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    this.scene.start('PreloadScene');
  }
}
