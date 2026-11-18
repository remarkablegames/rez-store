import type Phaser from 'phaser';

export interface PhotoTextures {
  clean: Phaser.Textures.CanvasTexture;
  aged: Phaser.Textures.CanvasTexture;
  grime: Phaser.Textures.CanvasTexture;
  dirtyCells: Set<number>;
  columns: number;
  rows: number;
  cellSize: number;
}
