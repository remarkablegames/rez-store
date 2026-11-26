import Phaser from 'phaser';

import { KEY, LAYOUT } from './constants';
import * as scenes from './scenes';
import { getQuery } from './utils/query';

const isCover = getQuery().scene === KEY.SCENE.COVER;

new Phaser.Game({
  width: isCover ? LAYOUT.COVER.WIDTH : LAYOUT.GAME.WIDTH,
  height: isCover ? LAYOUT.COVER.HEIGHT : LAYOUT.GAME.HEIGHT,
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
