import Phaser from 'phaser';
import type { PlayerAction } from '@echo-party/sim';

/**
 * InputHandler — polls Phaser input each frame and returns the player's action.
 * This is a thin adapter; no game logic here.
 */
export class InputHandler {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private spaceKey: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.wasd = {
      W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.spaceKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  /** Poll and return a player action, or null if no input this frame */
  poll(): PlayerAction | null {
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      return { type: 'attack' };
    }

    let dx = 0;
    let dy = 0;

    if (
      Phaser.Input.Keyboard.JustDown(this.cursors.left) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.A)
    ) {
      dx = -1;
    } else if (
      Phaser.Input.Keyboard.JustDown(this.cursors.right) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.D)
    ) {
      dx = 1;
    } else if (
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.W)
    ) {
      dy = -1;
    } else if (
      Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.S)
    ) {
      dy = 1;
    }

    if (dx !== 0 || dy !== 0) {
      return { type: 'move', dx, dy };
    }

    return null;
  }
}
