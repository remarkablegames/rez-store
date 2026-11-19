import Phaser from 'phaser';

import { KEY, LAYOUT } from '../constants';
import { createRandom } from '../utils';
import { createCanvasTexture } from './canvasTexture';

export function createBackgroundTexture(
  scene: Phaser.Scene,
): Phaser.Textures.CanvasTexture {
  const texture = createCanvasTexture(
    scene,
    KEY.TEXTURE.BACKGROUND,
    LAYOUT.GAME.WIDTH,
    LAYOUT.GAME.HEIGHT,
  );
  const { context } = texture;
  const random = createRandom();

  const base = context.createLinearGradient(0, 0, 0, LAYOUT.GAME.HEIGHT);
  base.addColorStop(0, '#241c16');
  base.addColorStop(0.52, '#171310');
  base.addColorStop(1, '#0d0b09');
  context.fillStyle = base;
  context.fillRect(0, 0, LAYOUT.GAME.WIDTH, LAYOUT.GAME.HEIGHT);

  // Warm desk lamp glow behind the photograph.
  const glow = context.createRadialGradient(
    LAYOUT.PHOTO.X,
    LAYOUT.PHOTO.Y - 30,
    30,
    LAYOUT.PHOTO.X,
    LAYOUT.PHOTO.Y - 30,
    520,
  );
  glow.addColorStop(0, 'rgba(207, 160, 91, 0.22)');
  glow.addColorStop(0.45, 'rgba(139, 102, 57, 0.09)');
  glow.addColorStop(1, 'rgba(20, 14, 10, 0)');
  context.fillStyle = glow;
  context.fillRect(0, 0, LAYOUT.GAME.WIDTH, LAYOUT.GAME.HEIGHT);

  // A faint pool of light around the HUD panel.
  const panelGlow = context.createRadialGradient(880, 120, 20, 880, 120, 360);
  panelGlow.addColorStop(0, 'rgba(173, 129, 69, 0.08)');
  panelGlow.addColorStop(1, 'rgba(20, 14, 10, 0)');
  context.fillStyle = panelGlow;
  context.fillRect(0, 0, LAYOUT.GAME.WIDTH, LAYOUT.GAME.HEIGHT);

  // Darkened edges.
  const vignette = context.createRadialGradient(
    LAYOUT.GAME.WIDTH / 2,
    LAYOUT.GAME.HEIGHT / 2,
    260,
    LAYOUT.GAME.WIDTH / 2,
    LAYOUT.GAME.HEIGHT / 2,
    760,
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.65, 'rgba(0, 0, 0, 0.16)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.52)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, LAYOUT.GAME.WIDTH, LAYOUT.GAME.HEIGHT);

  // Gentle paper-like speckle across the workbench.
  for (let index = 0; index < 1600; index++) {
    const x = random.between(0, LAYOUT.GAME.WIDTH - 1);
    const y = random.between(0, LAYOUT.GAME.HEIGHT - 1);
    const alpha = random.realInRange(0.015, 0.055);
    context.fillStyle = `rgba(245, 226, 190, ${String(alpha)})`;
    context.fillRect(x, y, 1, 1);
  }

  texture.refresh();
  return texture;
}
