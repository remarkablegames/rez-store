import Phaser from 'phaser';

import { KEY } from '../constants';

type UiSoundType = 'click' | 'select' | 'drop' | 'hover' | 'success' | 'fail';

const SOUND_KEYS: Record<UiSoundType, string> = {
  click: KEY.SOUND.UI_CLICK,
  select: KEY.SOUND.UI_SELECT,
  drop: KEY.SOUND.UI_DROP,
  hover: KEY.SOUND.UI_HOVER,
  success: KEY.SOUND.UI_SUCCESS,
  fail: KEY.SOUND.UI_FAIL,
} as const;

const VOLUMES: Record<UiSoundType, number> = {
  click: 0.6,
  select: 0.5,
  drop: 0.5,
  hover: 0.3,
  success: 0.4,
  fail: 0.4,
} as const;

const INTERVALS: Record<UiSoundType, number> = {
  click: 100,
  select: 100,
  drop: 100,
  hover: 150,
  success: 100,
  fail: 100,
} as const;

export class UiSound {
  private readonly scene: Phaser.Scene;
  private readonly lastPlay: Record<UiSoundType, number> = {
    click: 0,
    select: 0,
    drop: 0,
    hover: 0,
    success: 0,
    fail: 0,
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  play(type: UiSoundType): void {
    const now = this.scene.time.now;

    if (now - this.lastPlay[type] < INTERVALS[type]) {
      return;
    }

    this.lastPlay[type] = now;
    this.scene.sound.add(SOUND_KEYS[type]).play({ volume: VOLUMES[type] });
  }
}
