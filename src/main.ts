import Phaser from 'phaser';

import { KEY, LAYOUT } from './constants';
import * as scenes from './scenes';
import { getCoverLayout, getQuery } from './utils';

const query = getQuery();
const isCover = query.scene === KEY.SCENE.COVER;
const coverLayout = getCoverLayout(
  query.size?.width ?? LAYOUT.COVER.WIDTH,
  query.size?.height ?? LAYOUT.COVER.HEIGHT,
);

new Phaser.Game({
  width: isCover ? coverLayout.WIDTH : LAYOUT.GAME.WIDTH,
  height: isCover ? coverLayout.HEIGHT : LAYOUT.GAME.HEIGHT,
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
