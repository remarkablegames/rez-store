import { KEY } from '../constants';

export interface Query {
  level?: number;
  scene?:
    typeof KEY.SCENE.TITLE | typeof KEY.SCENE.GAME | typeof KEY.SCENE.SHOP;
  money?: number;
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
    (sceneRaw === KEY.SCENE.TITLE ||
      sceneRaw === KEY.SCENE.GAME ||
      sceneRaw === KEY.SCENE.SHOP)
  ) {
    query.scene = sceneRaw;
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
