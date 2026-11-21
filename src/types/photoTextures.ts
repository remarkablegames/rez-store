import type Phaser from 'phaser';

import type { DirtProfile } from './dirt';

export interface PhotoTextures {
  clean: Phaser.Textures.CanvasTexture;
  aged: Phaser.Textures.CanvasTexture;

  /** Loose dust, haze, and smudges that lift in a single pass. */
  grime: Phaser.Textures.CanvasTexture;

  /** Set-in stains and scratches that need repeated passes. */
  setIn: Phaser.Textures.CanvasTexture;

  /** Abrasion marks left by over-scrubbing. */
  damage: Phaser.Textures.CanvasTexture;

  columns: number;
  rows: number;
  cellSize: number;
  dirt: DirtProfile;
  looseCells: Float32Array;
  setInCells: Float32Array;
}
