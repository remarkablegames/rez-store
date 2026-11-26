import { KEY } from '../constants';

export interface Query {
  level?: number;
  scene?:
    | typeof KEY.SCENE.COVER
    | typeof KEY.SCENE.TITLE
    | typeof KEY.SCENE.GAME
    | typeof KEY.SCENE.SHOP;
  money?: number;
  size?: { width: number; height: number };
}

export function getQuery(): Query {
  const params = new URLSearchParams(window.location.search);
  const query: Query = {};

  const levelRaw = params.get('level');
  if (levelRaw !== null) {
    const level = Number(levelRaw);
    if (Number.isFinite(level) && level >= 0) {
      query.level = Math.floor(level);
    }
  }

  const sceneRaw = params.get('scene');
  if (
    sceneRaw !== null &&
    (sceneRaw === KEY.SCENE.COVER ||
      sceneRaw === KEY.SCENE.TITLE ||
      sceneRaw === KEY.SCENE.GAME ||
      sceneRaw === KEY.SCENE.SHOP)
  ) {
    query.scene = sceneRaw;
  }

  const sizeRaw = params.get('size');
  if (sizeRaw !== null) {
    const match = /^(\d+)x(\d+)$/i.exec(sizeRaw);
    if (match) {
      const width = Number(match[1]);
      const height = Number(match[2]);
      if (width > 0 && height > 0) {
        query.size = { width, height };
      }
    }
  }

  const moneyRaw = params.get('money');
  if (moneyRaw !== null) {
    const money = Number(moneyRaw);
    if (Number.isFinite(money) && money >= 0) {
      query.money = money;
    }
  }

  return query;
}
