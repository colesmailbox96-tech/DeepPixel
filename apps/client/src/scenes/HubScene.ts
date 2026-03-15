import Phaser from 'phaser';
import { CONTRACTS } from '@echo-party/content';
import type { ContractDef } from '@echo-party/shared';

/**
 * HubScene — the home base between runs.
 * Players select contracts and start runs.
 */
export class HubScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HubScene' });
  }

  create(): void {
    const { width } = this.cameras.main;

    this.add
      .text(width / 2, 60, 'Project Echo Party', {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 100, 'Select a Contract', {
        fontSize: '18px',
        color: '#aaaacc',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Render contract list
    const startY = 160;
    const spacing = 90;

    CONTRACTS.forEach((contract: ContractDef, index: number) => {
      const y = startY + index * spacing;

      // Contract name
      const nameText = this.add
        .text(width / 2, y, `[ ${contract.name} ]`, {
          fontSize: '20px',
          color: '#44aaff',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      // Description
      this.add
        .text(width / 2, y + 24, contract.description, {
          fontSize: '14px',
          color: '#888899',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);

      // Difficulty & rooms
      this.add
        .text(width / 2, y + 44, `Difficulty: ${contract.difficulty} | Rooms: ${contract.roomCount}`, {
          fontSize: '12px',
          color: '#666677',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);

      nameText.on('pointerover', () => nameText.setColor('#88ccff'));
      nameText.on('pointerout', () => nameText.setColor('#44aaff'));
      nameText.on('pointerdown', () => {
        this.startRun(contract);
      });
    });
  }

  private startRun(contract: ContractDef): void {
    const seed = `run-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    this.scene.start('RunScene', {
      contractId: contract.id,
      seed,
      difficulty: contract.difficulty,
      roomCount: contract.roomCount,
    });
  }
}
