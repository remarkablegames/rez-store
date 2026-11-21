import Phaser from 'phaser';

/**
 * Load photograph(s) into the texture cache in the background.
 */
export function loadPhoto(scene: Phaser.Scene, ...imageKeys: string[]): void {
  imageKeys.forEach((imageKey) => {
    if (!isPhotoCached(scene, imageKey)) {
      scene.load.image(imageKey, imageKey);
    }
  });
  scene.load.start();
}

/**
 * Whether an image has already been loaded into the texture cache.
 */
function isPhotoCached(scene: Phaser.Scene, imageKey: string): boolean {
  return scene.textures.exists(imageKey);
}
