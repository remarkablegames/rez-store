import Phaser from 'phaser';

/**
 * Clamp to 0 or 1.
 */
export function clampBinary(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Create seeded random data generator.
 */
export function createRandom(seed = Phaser.Math.RND.uuid()) {
  return new Phaser.Math.RandomDataGenerator([seed]);
}
