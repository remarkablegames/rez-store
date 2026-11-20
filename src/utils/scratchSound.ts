import Phaser from 'phaser';

import { KEY } from '../constants';

const SCRATCH_SOUND_INTERVAL = 80;
const SCRATCH_VOLUME = 0.3;

const HARD_SOUND_KEYS = [
  KEY.SOUND.SCRATCH_FAST1,
  KEY.SOUND.SCRATCH_FAST2,
  KEY.SOUND.SCRATCH_FAST3,
  KEY.SOUND.SCRATCH_FAST4,
  KEY.SOUND.SCRATCH_HARD,
] as const;

const SOFT_SOUND_KEYS = [
  KEY.SOUND.SCRATCH_SLOW,
  KEY.SOUND.SCRATCH_SOFT,
] as const;

export class ScratchSound {
  private readonly scene: Phaser.Scene;
  private lastPlay = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  play(hasGrime: boolean): void {
    const now = this.scene.time.now;

    if (now - this.lastPlay < SCRATCH_SOUND_INTERVAL) {
      return;
    }

    this.lastPlay = now;

    const keys = hasGrime ? HARD_SOUND_KEYS : SOFT_SOUND_KEYS;
    const key = keys[Math.floor(Math.random() * keys.length)];

    this.scene.sound.add(key).play({ volume: SCRATCH_VOLUME });
  }
}
