import Phaser from 'phaser';

import { KEY, LAYOUT } from '../constants';
import { createRandom } from '../utils';
import { createCanvasTexture } from './canvasTexture';
import { rgba } from './color';

interface BackgroundGlow {
  x: number;
  y: number;
  radius?: number;
}

interface BackgroundOptions {
  width?: number;
  height?: number;
  glow?: BackgroundGlow;
  panelGlow?: BackgroundGlow | null;
  vignette?: { inner: number; outer: number };
}

export function createBackgroundTexture(
  scene: Phaser.Scene,
  {
    width = LAYOUT.GAME.WIDTH,
    height = LAYOUT.GAME.HEIGHT,
    glow = { x: LAYOUT.PHOTO.X, y: LAYOUT.PHOTO.Y - 30 },
    panelGlow = { x: 880, y: 120 },
    vignette,
  }: BackgroundOptions = {},
): Phaser.Textures.CanvasTexture {
  const texture = createCanvasTexture(
    scene,
    KEY.TEXTURE.BACKGROUND,
    width,
    height,
  );
  const { context } = texture;
  const random = createRandom();

  const base = context.createLinearGradient(0, 0, 0, height);
  base.addColorStop(0, '#241c16');
  base.addColorStop(0.52, '#171310');
  base.addColorStop(1, '#0d0b09');
  context.fillStyle = base;
  context.fillRect(0, 0, width, height);

  // Warm desk lamp glow behind the photograph.
  const deskGlow = context.createRadialGradient(
    glow.x,
    glow.y,
    30,
    glow.x,
    glow.y,
    glow.radius ?? 520,
  );
  deskGlow.addColorStop(0, rgba(207, 160, 91, 0.22));
  deskGlow.addColorStop(0.45, rgba(139, 102, 57, 0.09));
  deskGlow.addColorStop(1, rgba(20, 14, 10, 0));
  context.fillStyle = deskGlow;
  context.fillRect(0, 0, width, height);

  // A faint pool of light around the HUD panel.
  if (panelGlow) {
    const panel = context.createRadialGradient(
      panelGlow.x,
      panelGlow.y,
      20,
      panelGlow.x,
      panelGlow.y,
      panelGlow.radius ?? 360,
    );
    panel.addColorStop(0, rgba(173, 129, 69, 0.08));
    panel.addColorStop(1, rgba(20, 14, 10, 0));
    context.fillStyle = panel;
    context.fillRect(0, 0, width, height);
  }

  // Darkened edges.
  const edge = context.createRadialGradient(
    width / 2,
    height / 2,
    vignette?.inner ?? Math.min(width, height) * 0.34,
    width / 2,
    height / 2,
    vignette?.outer ?? Math.max(width, height) * 0.74,
  );
  edge.addColorStop(0, rgba(0, 0, 0, 0));
  edge.addColorStop(0.65, rgba(0, 0, 0, 0.16));
  edge.addColorStop(1, rgba(0, 0, 0, 0.52));
  context.fillStyle = edge;
  context.fillRect(0, 0, width, height);

  // Gentle paper-like speckle across the workbench.
  const speckles = Math.round(
    (1600 * width * height) / (LAYOUT.GAME.WIDTH * LAYOUT.GAME.HEIGHT),
  );
  for (let index = 0; index < speckles; index++) {
    const x = random.between(0, width - 1);
    const y = random.between(0, height - 1);
    const alpha = random.realInRange(0.015, 0.055);
    context.fillStyle = rgba(245, 226, 190, alpha);
    context.fillRect(x, y, 1, 1);
  }

  texture.refresh();
  return texture;
}
