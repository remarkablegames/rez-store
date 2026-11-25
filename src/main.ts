import Phaser from 'phaser';

import { LAYOUT } from './constants';
import * as scenes from './scenes';

new Phaser.Game({
  width: LAYOUT.GAME.WIDTH, // 1024
  height: LAYOUT.GAME.HEIGHT, // 768
  title: 'Rez Store: Photo Repair Shop',
  url: import.meta.env.VITE_APP_HOMEPAGE,
  version: import.meta.env.VITE_APP_VERSION,
  scene: [
    scenes.Boot,
    ...Object.values(scenes).filter((scene) => scene !== scenes.Boot),
  ],
  disableContextMenu: import.meta.env.PROD,
  backgroundColor: '#171310',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
