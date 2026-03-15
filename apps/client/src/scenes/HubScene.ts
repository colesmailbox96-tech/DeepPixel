import Phaser from 'phaser';
import { CONTRACTS } from '@echo-party/content';
import type { ContractDef, MetaProgression } from '@echo-party/shared';
import { defaultMetaProgression, SaveAdapter } from '@echo-party/sim';

/**
 * HubScene — the home base between runs.
 * Players select contracts, view save slots, and start runs.
 * Also persists meta-progression via the save adapter.
 */
export class HubScene extends Phaser.Scene {
  private saveAdapter!: SaveAdapter;
  private meta: MetaProgression = defaultMetaProgression();
  private metaText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'HubScene' });
  }

  create(): void {
    this.saveAdapter = new SaveAdapter();

    // Load meta-progression asynchronously (Phaser create() is not async-aware).
    // this.meta is pre-initialised to defaultMetaProgression() so startRun()
    // always has a valid value even before the promise resolves or on failure.
    this.saveAdapter
      .loadMeta()
      .then((meta) => {
        this.meta = meta;
        this.renderMetaStats();
      })
      .catch(() => {
        this.meta = defaultMetaProgression();
        this.renderMetaStats();
      });

    const { width } = this.cameras.main;

    this.add
      .text(width / 2, 40, 'Project Echo Party', {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Meta-progression stats (updated once loaded)
    this.metaText = this.add
      .text(width / 2, 76, '', {
        fontSize: '12px',
        color: '#888899',
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
    const startY = 140;
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
        .text(
          width / 2,
          y + 44,
          `Difficulty: ${contract.difficulty} | Rooms: ${contract.roomCount}`,
          {
            fontSize: '12px',
            color: '#666677',
            fontFamily: 'monospace',
          },
        )
        .setOrigin(0.5);

      nameText.on('pointerover', () => nameText.setColor('#88ccff'));
      nameText.on('pointerout', () => nameText.setColor('#44aaff'));
      nameText.on('pointerdown', () => {
        this.startRun(contract);
      });
    });
  }

  private renderMetaStats(): void {
    if (this.meta && this.metaText) {
      this.metaText.setText(
        `Runs: ${this.meta.totalRuns} | Victories: ${this.meta.totalVictories}`,
      );
    }
  }

  private startRun(contract: ContractDef): void {
    // Math.random() is acceptable here: this generates a unique seed for the run.
    // Once the seed is set, ALL gameplay RNG flows through SeededRng in the sim layer.
    const seed = `run-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    this.scene.start('RunScene', {
      contractId: contract.id,
      seed,
      difficulty: contract.difficulty,
      roomCount: contract.roomCount,
      saveAdapter: this.saveAdapter,
      meta: this.meta,
    });
  }
}
