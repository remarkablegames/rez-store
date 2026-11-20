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

    Object.values(KEY.SOUND).forEach((sound) => {
      this.load.audio(sound, [`${sound}.ogg`, `${sound}.mp3`]);
    });
  }

  create() {
    this.scene.start(KEY.SCENE.TITLE);
  }
}
