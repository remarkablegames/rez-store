import Phaser from 'phaser';

import { KEY } from '../constants';
import { MusicManager } from '../utils';

export class Music extends Phaser.Scene {
  musicManager?: MusicManager;

  constructor() {
    super(KEY.SCENE.MUSIC);
  }

  create() {
    this.musicManager = new MusicManager(this);
  }
}
