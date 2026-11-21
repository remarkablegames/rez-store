import type Phaser from 'phaser';

import { KEY, LAYOUT } from '../constants';
import { createCanvasTexture } from './canvasTexture';
import { rgba } from './color';

/**
 * Create a warm pool of light for the work lamp.
 */
export function createLampGlowTexture(
  scene: Phaser.Scene,
): Phaser.Textures.CanvasTexture {
  const texture = createCanvasTexture(
    scene,
    KEY.TEXTURE.LAMP_GLOW,
    LAYOUT.PHOTO.WIDTH,
    LAYOUT.PHOTO.HEIGHT,
  );
  const { context } = texture;
  const centerX = LAYOUT.PHOTO.WIDTH / 2;
  const centerY = LAYOUT.PHOTO.HEIGHT * 0.36;
  const glow = context.createRadialGradient(
    centerX,
    centerY,
    30,
    centerX,
    centerY,
    LAYOUT.PHOTO.WIDTH * 0.7,
  );

  context.clearRect(0, 0, LAYOUT.PHOTO.WIDTH, LAYOUT.PHOTO.HEIGHT);
  glow.addColorStop(0, rgba(255, 238, 202, 0.42));
  glow.addColorStop(0.55, rgba(255, 230, 188, 0.16));
  glow.addColorStop(1, rgba(255, 228, 180, 0));
  context.fillStyle = glow;
  context.fillRect(0, 0, LAYOUT.PHOTO.WIDTH, LAYOUT.PHOTO.HEIGHT);

  texture.refresh();

  return texture;
}
