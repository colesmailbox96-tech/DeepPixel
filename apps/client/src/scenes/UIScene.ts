import Phaser from 'phaser';

/**
 * UIScene — persistent UI overlay that runs alongside other scenes.
 *
 * Phase 1: empty placeholder.
 * Will hold HUD, inventory, dialogue, etc. in later phases.
 */
export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    // UI overlay — populated in Phase 2+
  }
}
