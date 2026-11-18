import Phaser from 'phaser';

import { KEY } from '../constants';

export class Boot extends Phaser.Scene {
  constructor() {
    super(KEY.SCENE.BOOT);
  }

  preload() {
    Object.values(KEY.IMAGE).forEach((image) => {
      this.load.image(image, image);
    });
  }

  create() {
    this.scene.start(KEY.SCENE.GAME);
  }
}
