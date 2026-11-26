import Phaser from 'phaser';

interface PhotoFrameOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  border: number;
}

/**
 * Draw the cream photo frame used by the workbench and cover.
 */
export function createPhotoFrame(
  scene: Phaser.Scene,
  { x, y, width, height, border }: PhotoFrameOptions,
): Phaser.GameObjects.Graphics {
  const frameX = x - width / 2 - border;
  const frameY = y - height / 2 - border;
  const frameWidth = width + border * 2;
  const frameHeight = height + border * 2;
  const frame = scene.add.graphics();

  frame.fillStyle(0x000000, 0.22);
  frame.fillRoundedRect(frameX + 12, frameY + 16, frameWidth, frameHeight, 6);

  frame.fillStyle(0x000000, 0.32);
  frame.fillRoundedRect(frameX + 6, frameY + 8, frameWidth, frameHeight, 5);

  frame.fillStyle(0xefe5cf, 1);
  frame.fillRoundedRect(frameX, frameY, frameWidth, frameHeight, 3);

  frame.lineStyle(1, 0x8f836d, 0.65);
  frame.strokeRect(x - width / 2, y - height / 2, width, height);

  return frame;
}
