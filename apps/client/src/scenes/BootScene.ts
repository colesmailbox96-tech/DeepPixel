import Phaser from 'phaser';

/**
 * BootScene — first scene to run.
 * Handles minimal setup before asset loading begins.
 * Supports offline boot: the game starts regardless of network status.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    // Display offline indicator if not connected
    if (!navigator.onLine) {
      const { width } = this.cameras.main;
      this.add
        .text(width / 2, 14, '⚡ Offline Mode', {
          fontSize: '12px',
          color: '#ffaa44',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5)
        .setDepth(200);
    }

    // Proceed to preload — works offline because the service worker caches the shell
    this.scene.start('PreloadScene');
  }
}
