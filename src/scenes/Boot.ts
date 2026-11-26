import Phaser from 'phaser';

import { KEY } from '../constants';
import { getQuery, saveEarnings } from '../utils';

export class Boot extends Phaser.Scene {
  constructor() {
    super(KEY.SCENE.BOOT);
  }

  preload() {
    this.loadAudio(true);
  }

  private loadAudio(ui: boolean) {
    const sounds = Object.values(KEY.SOUND).filter((sound) => {
      const isUiSound = sound.startsWith('sounds/ui/');
      return ui === isUiSound;
    });

    sounds.forEach((sound) => {
      this.load.audio(sound, [`${sound}.ogg`, `${sound}.mp3`]);
    });

    this.load.start();
  }

  create() {
    this.scene.launch(KEY.SCENE.MUSIC);
    this.loadAudio(false);
    const query = getQuery();

    if (query.money !== undefined) {
      saveEarnings(query.money);
    }

    switch (query.scene) {
      case KEY.SCENE.COVER:
        this.scene.start(KEY.SCENE.COVER);
        break;

      case KEY.SCENE.GAME:
        this.scene.start(KEY.SCENE.GAME, {
          level: query.level ?? 0,
        });
        break;

      case KEY.SCENE.SHOP:
        this.scene.start(KEY.SCENE.SHOP, { level: query.level ?? 0 });
        break;

      default:
        this.scene.start(KEY.SCENE.TITLE);
        break;
    }
  }
}
