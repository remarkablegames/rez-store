import type Phaser from 'phaser';

export function createCanvasTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
): Phaser.Textures.CanvasTexture {
  if (scene.textures.exists(key)) {
    scene.textures.remove(key);
  }

  const texture = scene.textures.createCanvas(key, width, height);

  if (!texture) {
    throw new Error(`Could not create canvas texture: ${key}`);
  }

  return texture;
}
